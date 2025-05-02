import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { MovementData } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
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
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Eres un entrenador CrossFitista de élite especializado en técnica con barra. Vas a analizar un video que contiene varias repeticiones (por ejemplo, 3 Clean and Jerks seguidos). Sigue esta guía extremadamente detallada:

I. INSTRUCCIONES GENERALES:
1. Detecta y numera cada repetición: "Repetición 1", "Repetición 2", etc.
2. Para cada repetición, realiza:
   A. Fase por fase:
      - Clean: despliegue de fases del primer tirón y segundo tirón con ángulos de rodilla (~130° en primer tirón), cadera, hombro y codo.
      - Recepción: posición de rack frontal (codos >110°, barra descansando en el deltoides anterior), rodilla ~90°, tronco vertical.
      - Jerk: dip de piernas (5–10 cm), drive de piernas hacia arriba y extensión de codos hasta 180°, barra overhead estable.
   B. Ángulos claves:
      - Rodilla durante tirón y squat: cuantifica si supera 140° (extendido) o cae a ~90° (profundo).
      - Cadera: extensión completa (>160°) en loser de tirón.
      - Hombro y codo en lockout: hombro 180° y codo 175–180°.
   C. Trayectoria de la barra: describir si es vertical o en arco, rack frontal vs high bar.
   D. Timing y continuidad: medir transición entre fases (suave vs pausas).
   E. Diferenciación absoluta:
      - Si hay recepción en rack frontal y extensión total de codos con jerk, CELÍN Y ENVÍON seguro.
      - Si nunca llega a rack frontal y no hay extensión de codos, es squat (Front o Back según ángulo de codo >100° frontal o <90° trasero).

II. FORMATO DE RESPUESTA (EXACTO):
1. Identificación del Movimiento:
   Repetición 1: Clean and Jerk
   Repetición 2: Clean and Jerk
   Repetición 3: Clean and Jerk
2. Evaluación General:
   - Fluidez y timing: ...
   - Estabilidad de la barra: ...
   - Profundidad de cada squat: ...
   - Coordinación pierna-brazo: ...
3. Recomendaciones Técnicas:
   1. ...
   2. ...
4. Puntuación numérica:
   XX/100
Sin más explicaciones; sigue este esquema paso a paso y no agregues secciones ni cambies el orden.`
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const analysis = parseAIResponse(completion.choices[0].message.content);

    return NextResponse.json({
      success: true,
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
  // Use only selected key frames to limit token usage
  const keyFrames = selectKeyFrames(frames);

  return `Analiza esta secuencia de movimiento basándote en los puntos clave proporcionados.

IMPORTANTE - Calidad del Análisis:
Los frames proporcionados son capturas tomadas a 60 FPS (frames por segundo), lo que nos permite:
- Ver transiciones más suaves entre fases
- Detectar cambios sutiles en la técnica
- Analizar la velocidad y timing con más precisión
- Identificar mejor los puntos de transición entre fases

IMPORTANTE - Identificación del Movimiento:
Analiza la relación entre extremidades superiores e inferiores:
1. Movimiento de Piernas:
   - ¿Hay squat profundo? (rodilla ~90°)
   - ¿Es un dip corto? (rodilla >120°)
   - ¿Las piernas permanecen extendidas?
   - ¿Cuál es la velocidad de transición entre fases?

2. Posición de la Barra (CRÍTICO para diferenciar Front vs Back Squat):
   - Front Squat:
     * Codos ALTOS y paralelos al suelo
     * Ángulo del codo > 90°
     * Ángulo del hombro < 100°
     * Brazos en posición frontal
   - Back Squat:
     * Codos BAJOS y apuntando hacia abajo
     * Ángulo del codo < 90°
     * Ángulo del hombro > 100°
     * Brazos en posición trasera

3. Movimiento de Brazos:
   - ¿Los brazos mantienen una posición ESTÁTICA durante TODO el movimiento?
   - ¿La posición de los codos es consistente?
   - ¿El ángulo del hombro permanece constante?
   - ¿Hay algún cambio en la posición de la barra?

4. Coordinación:
   - ¿Los movimientos son simultáneos o secuenciales?
   - ¿Hay transición fluida entre fases?
   - ¿Cuál es la posición final de la barra?
   - ¿Hay pausas o es un movimiento continuo?

CRITERIOS DE IDENTIFICACIÓN:
1. Front Squat:
   - Los codos DEBEN estar ALTOS (>90°) y paralelos al suelo
   - El ángulo del hombro DEBE ser < 100°
   - Los brazos DEBEN mantener posición frontal fija
   - NO debe haber movimiento de brazos

2. Back Squat:
   - Los codos DEBEN estar BAJOS (<90°) y apuntando hacia abajo
   - El ángulo del hombro DEBE ser > 100°
   - Los brazos DEBEN mantener posición trasera fija
   - NO debe haber movimiento de brazos

3. Thruster:
   - DEBE haber un press sobre cabeza al final
   - Los brazos comienzan estáticos pero se activan en la fase de drive
   - El ángulo del hombro cambia significativamente
   - Hay coordinación entre la extensión de piernas y el press

Datos del Movimiento:
${keyFrames.map((frame, i) => `
Frame ${i + 1} - Tiempo: ${frame.timestamp.toFixed(3)}s
- Fase: ${frame.phase}
- Ángulos Articulares:
  * Rodilla: ${frame.angles.knee}° (>140° extendido, ~90° squat profundo)
  * Cadera: ${frame.angles.hip}° (>160° extendido, <90° squat profundo)
  * Hombro: ${frame.angles.shoulder}° (0° abajo, 90° frontal, 180° arriba)
  * Codo: ${frame.angles.elbow}° (180° extendido, ~90° rack position)

Análisis de Posición:
* Piernas: ${frame.angles.knee > 140 ? 'Extendidas' : frame.angles.knee < 100 ? 'Squat Profundo' : 'Dip Parcial'}
* Posición de Barra: ${frame.angles.elbow > 90 && frame.angles.shoulder < 100 ? 'Front Rack' : frame.angles.elbow < 90 && frame.angles.shoulder > 100 ? 'Back Rack' : 'Posición Indeterminada'}
* Estabilidad de Brazos: ${frame.phase.includes('squat_bottom') ? 'CRÍTICO - Verificar Estabilidad' : 'Monitorear Movimiento'}
* Indicadores de Movimiento:
  - Es Front Squat: ${frame.phase.includes('front_squat_bottom') ? 'Probable' : 'Por Determinar'}
  - Es Back Squat: ${frame.phase.includes('back_squat_bottom') ? 'Probable' : 'Por Determinar'}
  - Es Thruster: ${frame.phase === 'drive' ? 'Probable' : 'Por Determinar'}
`).join('\n')}

FORMATO REQUERIDO DE RESPUESTA:

1. Identificación del Movimiento
[OBLIGATORIO] Para cada repetición en orden de aparición, nómbrala y clasifícala:
- Clean and Jerk: SOLO si se observa tirón explosivo, recepción en rack frontal y jerk sobre cabeza.
- Snatch: SOLO si hay tirón único hasta overhead y recepción en overhead squat.
- Thruster: SOLO si combina front squat con press continuo hasta overhead.
- Push Press: SOLO si hay un dip corto seguido de press sobre cabeza.
- Front Squat: SOLO si los codos se mantienen altos (>90°) y los brazos sin movimiento.
- Back Squat: SOLO si los codos se mantienen bajos (<90°) y los brazos sin movimiento.

2. Evaluación General
[OBLIGATORIO] Análisis global de todas las repeticiones, incluyendo:
- Fluidez y timing.
- Estabilidad de la posición de la barra.
- Profundidad de cada squat.
- Coordinación entre extremidades.

3. Recomendaciones Técnicas
[OBLIGATORIO] Lista numerada de aspectos a mejorar.

4. Puntuación numérica
[OBLIGATORIO] Calificación de 0 a 100 basada en:
- Técnica general (40%).
- Estabilidad y control (30%).
- Rango de movimiento (30%).

NO uses comillas en ninguna parte de tu respuesta
DEBES comenzar con la identificación del movimiento
DEBES incluir todas las secciones en este orden exacto
DEBES mantener la numeración y títulos exactos
Las recomendaciones DEBEN estar numeradas
NO omitas ninguna sección
NO cambies el orden`;
}

function selectKeyFrames(frames: MovementData[]): MovementData[] {
  // Select representative frames for analysis
  // For now, let's take frames at 0%, 25%, 50%, 75%, and 100% of the movement
  const keyFrameIndices = [
    0,
    Math.floor(frames.length * 0.25),
    Math.floor(frames.length * 0.5),
    Math.floor(frames.length * 0.75),
    frames.length - 1
  ];

  return keyFrameIndices.map(i => frames[i]);
}

function parseAIResponse(response: string | null): {
  movement: string;
  feedback: string;
  recommendations: string[];
  score: number;
} {
  if (!response) {
    return {
      movement: "Movimiento no identificado",
      feedback: "No se pudo analizar el movimiento",
      recommendations: [],
      score: 0
    };
  }

  // Remove any quotes from the response
  response = response.replace(/["""]/g, '');

  // Split response into sections based on numbered headers
  const sections = response.split(/\d+\.\s+(?:Identificación del Movimiento|Evaluación General|Recomendaciones Técnicas|Puntuación numérica)/i);
  
  // Extract movement (should be the first section after the split)
  const movementSection = sections[1]?.trim() || "";
  const movement = movementSection.split('\n')[0]?.trim() || "Movimiento no identificado";
  
  // Extract feedback
  const feedback = sections[2]?.trim() || "No hay retroalimentación disponible";
  
  // Extract and format recommendations
  const recommendationsText = sections[3]?.trim() || "";
  const recommendations = recommendationsText
    .split(/\d+\.\s+/) // Split by numbered items
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.replace(/^[-•]\s*/, '')); // Remove any bullet points

  // Extract score with the exact format
  const scoreMatch = response.match(/Puntuación numérica:\s*(\d{1,3})/i);
  const score = scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1]))) : 50;

  return {
    movement,
    feedback,
    recommendations,
    score
  };
} 