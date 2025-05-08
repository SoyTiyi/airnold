import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { MovementData, MovementAnalysis } from '@/types';
import liftAnalysisPrompt from '../../../prompts/liftAnalysisPrompt'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const { frames } = await request.json() as { frames: MovementData[] };

    if (!frames || frames.length === 0) {
      return NextResponse.json(
        { error: 'No movement data provided' },
        { status: 400 }
      );
    }

    // Prepare the analysis prompt
    const prompt = generateAnalysisPrompt(frames);

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: liftAnalysisPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const analysis = parseAIResponse(completion.choices[0].message.content);

    return NextResponse.json({
      analysis
    });
  } catch (error) {
    console.error('Error analyzing movement:', error);
    return NextResponse.json(
      { error: 'Failed to analyze movement' },
      { status: 500 }
    );
  }
}

function generateAnalysisPrompt(frames: MovementData[]): string {
  // Elegimos sólo los keyframes relevantes para el único levantamiento
  const keyFrames = selectKeyFrames(frames);

  // Tomamos el primer (y único) gesto de interés
  const mv = keyFrames[0];

  return `Analiza este vídeo que contiene **UN ÚNICO levantamiento olímpico**. 
Tu tarea es determinar si se trata de un **Snatch** o un **Clean and Jerk**, 
analizar las fases y ángulos clave, y entregar feedback y recomendaciones
en el siguiente formato exacto (no generes nada fuera de este esquema):

1. Identificación del Movimiento
[Movimiento]: Snatch o Clean and Jerk

2. Feedback General
[Mecánica del movimiento]: …

[Trayectoria y control]: …

[Posiciones clave]: …

[Estabilidad y balance]: …

3. Recomendaciones
1. …
2. …
3. …

4. Puntuación
[NÚMERO entre 0–100]

---

## DATOS DEL MOVIMIENTO ÚNICO:
Frame clave – Tiempo: ${mv.timestamp.toFixed(3)}s  
- Fase detectada: ${mv.phase}  
- Ángulos articulares:  
  * Rodilla: ${mv.angles.knee}°  
  * Cadera: ${mv.angles.hip}°  
  * Hombro: ${mv.angles.shoulder}°  
  * Codo: ${mv.angles.elbow}°  

- Posición de la barra: ${
    mv.angles.elbow > 90 && mv.angles.shoulder >= 70 && mv.angles.shoulder <= 140
      ? 'Front rack (confirma Clean and Jerk)'
      : mv.angles.shoulder > 160 && mv.angles.elbow > 160
        ? 'Overhead lockout'
        : mv.angles.knee > 140 && mv.angles.hip > 140
          ? 'Pull con codos extendidos (posible Snatch)'
          : 'Posición intermedia'
  }  

- Indicadores clave:  
  • Overhead final: ${mv.angles.shoulder > 160 && mv.angles.elbow > 160 ? 'Sí' : 'No'}  
  • Rack frontal: ${mv.angles.elbow > 90 && mv.angles.shoulder >= 70 && mv.angles.shoulder <= 140 ? 'Sí' : 'No'}  
  • Extensión de codos en pull: ${mv.angles.elbow > 160 ? 'Completa' : 'Flexionada'}  

---

**IMPORTANTE**:  
- Este prompt asume un solo levantamiento—ignora cualquier otra repetición.  
- Mantén las secciones y el formato exacto descrito arriba.  
- No añadas ni quites apartados, ni modifiques los títulos entre corchetes.`;
}

function selectKeyFrames(frames: MovementData[]): MovementData[] {
  const N = frames.length;
  if (N <= 10) return frames;  // muy pocos frames: devolvemos todo

  // 1) ALWAYS include first & last
  const keySet = new Set<MovementData>([frames[0], frames[N-1]]);

  // 2) Find deepest squat (min hip angle)
  const minHip = frames.reduce((best, f) =>
    f.angles.hip < best.angles.hip ? f : best
  , frames[0]);
  keySet.add(minHip);

  // 3) Find maximum extension (max hip angle)
  const maxHip = frames.reduce((best, f) =>
    f.angles.hip > best.angles.hip ? f : best
  , frames[0]);
  keySet.add(maxHip);

  // 4) Detect front rack entry (first frame where elbow>90° & shoulder≈90°)
  const rack = frames.find(f =>
    f.angles.elbow > 90 &&
    f.angles.shoulder > 70 && f.angles.shoulder < 110
  );
  if (rack) keySet.add(rack);

  // 5) Detect overhead lockout (first frame where shoulder>160° & elbow>160°)
  const lockout = frames.find(f =>
    f.angles.shoulder > 160 && f.angles.elbow > 160
  );
  if (lockout) keySet.add(lockout);

  // 6) (Opcional) Añadir un par de frames equidistantes para contexto
  const extras = 2;
  for (let i = 1; i <= extras; i++) {
    const idx = Math.floor((N - 1) * (i / (extras + 1)));
    keySet.add(frames[idx]);
  }
  
  // Convertimos a array y ordenamos por timestamp
  return Array.from(keySet)
    .sort((a, b) => a.timestamp - b.timestamp);
}

function parseAIResponse(response: string | null): MovementAnalysis {
  const defaultResult = {
    movement: "Movimiento no identificado",
    feedback: "No se pudo analizar el movimiento",
    recommendations: [],
    score: 0
  };
  
  if (!response) return defaultResult;

  try {
    // Clean stray quotes
    const text = response.replace(/["""]/g, '');

    // Extract movement for multiple repetitions
    let movSection;
    
    // Try different section header formats to extract movement data
    const headerFormats = [
      /1\.\s*Identificación de Repeticiones\s*\n+([\s\S]*?)(?=\s*2\.\s*Feedback)/i,
      /1\.\s*Identificación de Repeticiones:\s*\n+([\s\S]*?)(?=\s*2\.\s*Feedback)/i,
      /Identificación de Repeticiones\s*\n+([\s\S]*?)(?=\s*Feedback General)/i,
      /1\.\s*Movimiento Detectado\s*\n+([\s\S]*?)(?=\s*2\.\s*Feedback)/i,
      /1\.\s*Identificación del Movimiento\s*\n+([\s\S]*?)(?=\s*2\.\s*Feedback)/i
    ];
    
    for (const format of headerFormats) {
      const match = text.match(format);
      if (match && match[1]) {
        movSection = match;
        break;
      }
    }
    
    let movement = defaultResult.movement;
    
    if (movSection && movSection[1]) {
      // Extract all repetitions and join them
      const repetitionsSection = movSection[1].trim();
      
      // Try to find lines that look like repetition lines
      const repLines = repetitionsSection
        .split('\n')
        .filter(line => line.match(/Repetición\s*\d+/i) || line.match(/Rep\s*\d+/i))
        .map(line => line.trim());
      
      if (repLines.length > 0) {
        movement = repLines.join('\n');
      } else {
        // If we couldn't find repetition lines, use the whole section
        movement = repetitionsSection;
      }
    }

    // Extract feedback
    // Try different formats to match feedback section
    let feedbackMatch;
    const feedbackFormats = [
      /2\.\s*Feedback General\s*\n+([\s\S]*?)(?=\s*3\.\s*Recomendaciones)/i,
      /Feedback General:\s*\n+([\s\S]*?)(?=\s*Recomendaciones)/i,
      /Feedback General\s*\n+([\s\S]*?)(?=\s*Recomendaciones)/i
    ];
    
    for (const format of feedbackFormats) {
      const match = text.match(format);
      if (match && match[1]) {
        feedbackMatch = match;
        break;
      }
    }
    
    let feedback = '';
    if (feedbackMatch && feedbackMatch[1]) {
      // Convertimos los encabezados con formato [Título]: a formato markdown **Título**:
      feedback = feedbackMatch[1].trim()
        .replace(/\[([^[\]]+)\]:/g, '**$1**:') // Convertir [Título]: a **Título**:
        .replace(/\[([^[\]]+)\]\s+/g, '**$1** '); // Also handle [Título] without colon
    } else {
      feedback = defaultResult.feedback;
    }

    // Extract recommendations
    // Try different formats for recommendations section
    let recMatch;
    const recFormats = [
      /3\.\s*Recomendaciones\s*\n+([\s\S]*?)(?=\s*4\.\s*Puntuación)/i,
      /Recomendaciones:\s*\n+([\s\S]*?)(?=\s*Puntuación)/i,
      /Recomendaciones\s*\n+([\s\S]*?)(?=\s*Puntuación)/i
    ];
    
    for (const format of recFormats) {
      const match = text.match(format);
      if (match && match[1]) {
        recMatch = match;
        break;
      }
    }
    
    let recommendations: string[] = [];
    
    if (recMatch && recMatch[1]) {
      const recSection = recMatch[1].trim();
      
      // Try to extract numbered recommendations
      const recRegex = /\s*(\d+)[\.\)]\s*([^\d\n]+)/g;
      let recMatches;
      const foundRecs = [];
      
      while ((recMatches = recRegex.exec(recSection)) !== null) {
        foundRecs.push(recMatches[2].trim());
      }
      
      if (foundRecs.length > 0) {
        recommendations = foundRecs;
      } else {
        // Fallback: split by lines and filter empty ones
        recommendations = recSection
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
      }
    }

    // Extract score
    // Try different formats for score section
    let scoreMatch;
    const scoreFormats = [
      /4\.\s*Puntuación[^0-9]*(\d+)/i,
      /Puntuación:[^0-9]*(\d+)/i,
      /Puntuación[^0-9]*(\d+)/i,
      /(\d+)[^\d\n]*%/
    ];
    
    for (const format of scoreFormats) {
      const match = text.match(format);
      if (match && match[1]) {
        scoreMatch = match;
        break;
      }
    }
    
    let score = 0;
    
    if (scoreMatch && scoreMatch[1]) {
      // Convertir a número y limitar entre 0-100
      score = Math.min(100, Math.max(0, parseInt(scoreMatch[1], 10)));
    }

    return { movement, feedback, recommendations, score };
  } catch (error) {
    // If there was an error parsing, let's try a very basic parsing as fallback
    try {
      // Extract any movement name
      const movMatch = response.match(/Repetición\s*\d+:\s*([^\n]+)/i);
      const movement = movMatch ? movMatch[1].trim() : defaultResult.movement;
      
      // Get any score number
      const scoreMatch = response.match(/(\d{1,3})\s*%/);
      const score = scoreMatch ? Math.min(100, parseInt(scoreMatch[1], 10)) : 0;
      
      // Return at least partial data if possible
      return { 
        movement, 
        feedback: "Error en formato de análisis. Datos parciales recuperados.", 
        recommendations: [],
        score
      };
    } catch (e) {
      return defaultResult;
    }
  }
}

// Calculate the maximum angular change in a particular joint across the sequence
function calculateAngularChange(frames: MovementData[], jointType: keyof MovementData['angles']): number {
  if (frames.length < 2) return 0;
  
  let minAngle = Infinity;
  let maxAngle = -Infinity;
  
  frames.forEach(frame => {
    const angle = frame.angles[jointType];
    minAngle = Math.min(minAngle, angle);
    maxAngle = Math.max(maxAngle, angle);
  });
  
  return Math.round(maxAngle - minAngle);
}

// Detect if front rack position is present in any frame
function detectFrontRack(frames: MovementData[]): boolean {
  return frames.some(frame => 
    frame.angles.elbow > 90 && 
    frame.angles.shoulder < 140 && 
    frame.angles.shoulder > 70
  );
}

// Detect if overhead position is present in any frame
function detectOverhead(frames: MovementData[]): boolean {
  return frames.some(frame => 
    frame.angles.shoulder > 150 && 
    frame.angles.elbow > 140
  );
}