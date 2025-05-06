import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { MovementData, MovementAnalysis } from '@/types';

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
          content: `Eres un entrenador CrossFitista de élite especializado en técnica con barra. Vas a analizar un video que contiene varias repeticiones (por ejemplo, 3 Clean and Jerks seguidos). Tu objetivo es identificar y analizar CADA repetición individualmente, y luego dar un feedback general. 

INSTRUCCIÓN CRUCIAL: Si observas CUALQUIERA de estos patrones, debes clasificar el movimiento como CLEAN AND JERK (no como squat):
1. Si en CUALQUIER momento la barra pasa de una posición baja a estar sobre los hombros (front rack)
2. Si los codos rotan de una posición baja a una posición alta (>90°) durante el movimiento
3. Si la barra termina por encima de la cabeza en CUALQUIER momento
4. Si hay una secuencia que muestra: tirón → recepción con codos altos → overhead

El Clean and Jerk se caracteriza por:
- Ángulos de codo que cambian drásticamente a lo largo del movimiento
- La barra pasa por múltiples posiciones verticales
- Presencia de una fase de recepción seguida de un press overhead
- Los hombros rotan de una posición baja a una posición alta

Incluso si solo ves PARCIALMENTE estas características, debes favorecer la clasificación Clean and Jerk sobre Back Squat.

I. INSTRUCCIONES GENERALES:
1. PRIMERO identifica cuántas repeticiones hay en total en la secuencia de video.
2. Para CADA repetición, debes realizar:
   A. Identificación clara del tipo de movimiento:
      - Clean and Jerk: Identificable por las fases de tirón+recepción en rack frontal+jerk (extensión de brazos overhead)
      - Clean: Tirón + recepción en rack frontal (sin jerk)
      - Squat: Front o Back según posición de codos y hombros (SOLO clasificar como squat si es claramente visible y NO hay indicio de Clean and Jerk)
      - Otros movimientos (Snatch, Thruster, etc.)
   
   B. ESPECÍFICAMENTE para Clean and Jerk busca:
      - Fase 1 - Pull/Tirón: Extensión desde la posición inicial
      - Fase 2 - Recepción en Rack Frontal: Codos altos (>90°) y barra descansando en deltoides
      - Fase 3 - Dip & Drive: Pequeña flexión de rodillas seguida de empuje explosivo
      - Fase 4 - Jerk: Recepción con brazos extendidos overhead (hombros ~180°, codos extendidos)

   C. Ángulos clave a analizar en CADA repetición:
      - Rodilla en posición inicial: ~120-130°
      - Rodilla en recepción: ~90° (squat profundo)
      - Cadera en extensión completa: >160° durante pull
      - Codos en rack frontal: >90° (posición de front rack adecuada)
      - Hombros y codos en fase final: ~180° en overhead lockout

3. Distinguir entre movimientos similares:
   - Clean and Jerk vs Back Squat:
     * Clean and Jerk tiene una fase donde la barra está en front rack Y cambios en ángulos de codos
     * Back Squat mantiene ángulos de codo constantes y barra en la espalda
   
   - Clean and Jerk vs Front Squat:
     * Ambos tienen una posición similar de rack frontal
     * En Clean and Jerk hay CAMBIO en la posición de los brazos durante el movimiento
     * En Front Squat NO hay cambio en la posición de los brazos

   - Clean and Jerk vs Thruster:
     * Ambos terminan con la barra overhead
     * Clean and Jerk tiene una clara separación entre la recepción y el jerk
     * Thruster es un movimiento más fluido sin pausa entre squat y press

II. FORMATO DE RESPUESTA (EXACTO - SIGUE ESTE FORMATO AL PIE DE LA LETRA):
1. Identificación de Repeticiones:
   Repetición 1: [Nombre del Movimiento]
   Repetición 2: [Nombre del Movimiento]
   Repetición 3: [Nombre del Movimiento]
   (Identifica todas las repeticiones existentes)
   
2. Feedback General:
   [Fluidez y timing]: El levantador presenta fluidez y buen timing en cada repetición. [Análisis detallado]
   
   [Estabilidad de la barra]: [Análisis detallado]
   
   [Profundidad adecuada]: [Análisis detallado]
   
   [Coordinación]: [Análisis detallado]

3. Recomendaciones:
   1. [Primera recomendación detallada]
   2. [Segunda recomendación detallada]
   3. [Tercera recomendación detallada]

4. Puntuación (0-100):
   85

Observaciones importantes:
- NO uses guiones (-) al inicio de los párrafos en el Feedback General
- Usa encabezados entre corchetes [Título] seguidos de: para cada aspecto del feedback
- Asegúrate de que la puntuación sea un número entre 0 y 100, no escribas "puntos" o "%" después
- Presenta cada sección del feedback en párrafos separados, no en una lista con guiones
- Asegúrate de numerar las recomendaciones correctamente`
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
  // Use selected key frames to limit token usage
  const keyFrames = selectKeyFrames(frames);

  return `Analiza esta secuencia de movimiento basándote en los puntos clave proporcionados.

CRÍTICO - PRIORIDAD DE ANÁLISIS:
Tu objetivo principal es identificar si el movimiento es un Clean and Jerk. ANTES de decidir si es un Back Squat, revisa cuidadosamente los siguientes indicadores de Clean and Jerk:

1. CAMBIOS en ángulos de codo (si cambian de <90° a >90° durante la secuencia)
2. CAMBIOS en la posición vertical de la barra (si sube de la cadera a los hombros o sobre la cabeza)
3. CUALQUIER frame que muestre la barra sobre los hombros (front rack) o en posición elevada
4. Presencia de fases distintas que indican Clean and Jerk (tirón → recepción → jerk)

IMPORTANTE - Calidad del Análisis:
Los frames proporcionados son capturas tomadas a 60 FPS (frames por segundo). Debido a limitaciones de tokens, solo te mostramos una muestra de estos frames. Analiza cuidadosamente la progresión entre frames - puede haber saltos entre etapas del movimiento.

IMPORTANTE - Identificación del Movimiento:
Analiza la secuencia completa de movimientos y busca estas secuencias específicas:

1. Para Clean and Jerk busca esta progresión (que puede estar distribuida en diferentes frames):
   - Posición inicial: Barra baja, codos extendidos, hombros bajos
   - Transición: Cambios en ángulos de rodilla/cadera (tirón)
   - Front rack en CUALQUIER momento: Codos >90° con barra apoyada en hombros/deltoides
   - Cualquier indicio de fase overhead: Brazos extendidos sobre cabeza o en posición elevada
   
   NOTA: El movimiento puede ser parcial o incompleto. Si ves CUALQUIER indicación de clean o jerk, clasifícalo como Clean and Jerk.

2. Diferencias CLAVE Clean and Jerk vs Back Squat:
   - Clean and Jerk: Los ángulos de codo VARÍAN durante la secuencia (aumentan significativamente)
   - Back Squat: Los ángulos de codo se MANTIENEN CONSTANTES en <90° durante todo el movimiento
   - Clean and Jerk: La barra cambia de altura vertical significativamente
   - Back Squat: La barra mantiene altura similar en relación a los hombros

3. Identifica múltiples repeticiones buscando:
   - Retorno a una posición similar a la inicial
   - Ciclos completos donde la barra sube y luego baja o retorna a posición inicial
   - Cada ciclo completo es una repetición independiente

Datos del Movimiento:
${keyFrames.map((frame, i) => `
Frame ${i + 1} - Tiempo: ${frame.timestamp.toFixed(3)}s
- Fase: ${frame.phase}
- Ángulos Articulares:
  * Rodilla: ${frame.angles.knee}° (>140° extendido, ~90° squat profundo)
  * Cadera: ${frame.angles.hip}° (>160° extendido, <90° squat profundo)
  * Hombro: ${frame.angles.shoulder}° (0° abajo, 90° frontal, 180° arriba)
  * Codo: ${frame.angles.elbow}° (180° extendido, ~90° rack position)

Análisis Detallado:
* Posición de Barra: ${
    frame.angles.elbow > 90 && frame.angles.shoulder < 140 
      ? 'FRONT RACK (posible Clean)' 
      : frame.angles.elbow < 90 && frame.angles.shoulder > 120 
        ? 'Back Rack (posible Back Squat)' 
        : frame.angles.shoulder > 160 && frame.angles.elbow > 140
          ? 'OVERHEAD (fase de Jerk)'
          : frame.angles.knee > 140 && frame.angles.hip > 140
            ? 'Fase de Tirón/Pull (posible inicio de Clean)'
            : 'Posición Transitoria'
  }

* Indicadores de Clean and Jerk:
  - Fase de Pull/Tirón: ${frame.angles.knee > 120 && frame.angles.hip > 120 ? 'PRESENTE' : 'No detectada'}
  - Front Rack: ${frame.angles.elbow > 90 && frame.angles.shoulder < 140 ? 'PRESENTE' : 'No detectada'}
  - Posición Overhead: ${frame.angles.shoulder > 160 && frame.angles.elbow > 140 ? 'PRESENTE' : 'No detectada'}
  - Posible Clean and Jerk: ${
      (frame.angles.elbow > 90 && frame.angles.shoulder < 140) || 
      (frame.angles.shoulder > 160 && frame.angles.elbow > 140) ? 
      'ALTA PROBABILIDAD' : 'Indeterminado'
    }
`).join('\n')}

ANÁLISIS DE CAMBIOS CRÍTICOS (esto es clave para diferenciar Clean and Jerk de Back Squat):

Variación de ángulos en la secuencia:
* Cambio máximo en codos: ${calculateAngularChange(keyFrames, 'elbow')}° ${calculateAngularChange(keyFrames, 'elbow') > 30 ? '(INDICA CLEAN AND JERK)' : ''}
* Cambio máximo en hombros: ${calculateAngularChange(keyFrames, 'shoulder')}° ${calculateAngularChange(keyFrames, 'shoulder') > 50 ? '(INDICA CLEAN AND JERK)' : ''}
* Front rack detectado: ${detectFrontRack(keyFrames) ? 'SÍ (INDICA CLEAN AND JERK)' : 'No'}
* Overhead detectado: ${detectOverhead(keyFrames) ? 'SÍ (INDICA CLEAN AND JERK)' : 'No'}

CONCLUSIÓN AUTOMÁTICA: ${
  (calculateAngularChange(keyFrames, 'elbow') > 30 || 
   calculateAngularChange(keyFrames, 'shoulder') > 50 ||
   detectFrontRack(keyFrames) ||
   detectOverhead(keyFrames)) ? 
  'Las métricas sugieren CLEAN AND JERK como clasificación más probable' : 
  'Indeterminado - revisar criterios adicionales'
}

FORMATO REQUERIDO DE RESPUESTA (SIGUE ESTE FORMATO EXACTAMENTE):

1. Identificación de Repeticiones
[IMPORTANTE] Clasificación precisa de cada repetición:
Repetición 1: [Movimiento identificado]
Repetición 2: [Movimiento identificado] (si existe)
Repetición 3: [Movimiento identificado] (si existe)
(incluye todas las repeticiones que identifiques)

2. Feedback General
[Fluidez y timing]: Descripción detallada de la fluidez y timing en párrafo completo, sin guiones.

[Estabilidad de la barra]: Descripción detallada de la estabilidad en párrafo completo.

[Profundidad de cada squat]: Análisis específico de la profundidad alcanzada.

[Coordinación pierna-brazo]: Evaluación de la coordinación entre extremidades.

3. Recomendaciones
1. Primera recomendación específica en formato de oración completa.
2. Segunda recomendación detallada.
3. Tercera recomendación con aspectos concretos a mejorar.

4. Puntuación numérica
[VALOR NUMÉRICO ENTRE 0-100, SIN SÍMBOLOS] (ejemplo: 85)`;
}

function selectKeyFrames(frames: MovementData[]): MovementData[] {
  // If we have a small number of frames, use all of them
  if (frames.length <= 20) {
    return frames;
  }
  
  // For larger sequences, take more representative samples to better capture multiple repetitions
  // This helps identify transition points between repetitions
  
  // Estimate how many repetitions we might have (assuming 60 frames for a typical movement)
  // This is a rough heuristic to ensure we pick enough frames to identify multiple repetitions
  const estimatedReps = Math.max(1, Math.ceil(frames.length / 60));
  const samplesPerRep = Math.min(10, Math.floor(20 / estimatedReps));
  
  const keyFrames: MovementData[] = [];
  
  // Always include first and last frame
  keyFrames.push(frames[0]);
  
  // Add evenly distributed frames to capture the full sequence
  // This helps identify transitions between repetitions
  for (let i = 1; i < frames.length - 1; i += Math.max(1, Math.floor(frames.length / 20))) {
    keyFrames.push(frames[i]);
  }
  
  // Add the last frame
  if (frames.length > 1) {
    keyFrames.push(frames[frames.length - 1]);
  }
  
  // Ensure we have at most 25 frames to avoid token limits
  if (keyFrames.length > 25) {
    // If we have too many frames, sample them evenly
    const step = Math.ceil(keyFrames.length / 25);
    const sampledFrames: MovementData[] = [];
    
    // Always include first frame
    sampledFrames.push(keyFrames[0]);
    
    // Sample the middle frames
    for (let i = step; i < keyFrames.length - 1; i += step) {
      sampledFrames.push(keyFrames[i]);
    }
    
    // Always include last frame
    sampledFrames.push(keyFrames[keyFrames.length - 1]);
    
    return sampledFrames;
  }
  
  return keyFrames;
}

function parseAIResponse(response: string | null): MovementAnalysis {
  const defaultResult = {
    movement: "Movimiento no identificado",
    feedback: "No se pudo analizar el movimiento",
    recommendations: [],
    score: 0
  };
  
  console.log("Raw response from OpenAI:", response);
  
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

    console.log("Parsed result:", { movement, feedback: feedback.substring(0, 50) + "...", recommendations, score });
    return { movement, feedback, recommendations, score };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    
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
      console.error('Fallback parsing also failed:', e);
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