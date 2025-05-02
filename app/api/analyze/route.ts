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
          content: `Eres un entrenador experto de CrossFit especializado en analizar movimientos con barra y pesas. Tu tarea es identificar y analizar los siguientes tipos de movimientos basándote en sus patrones característicos:

Movimientos Olímpicos:
- Clean and Jerk (Arranque):
  * Fase 1: Primer tirón desde suelo (rodillas y cadera flexionadas)
  * Fase 2: Segundo tirón explosivo (extensión completa)
  * Fase 3: Recepción en rack frontal
  * Fase 4: Jerk - press sobre cabeza con dip and drive

- Snatch (Envión):
  * Fase única de tirón desde suelo a sobre cabeza
  * Recepción en overhead squat
  * Ángulos de hombro muy amplios durante todo el movimiento

Squats y Movimientos de Pierna:
- Back Squat (Sentadilla Trasera):
  * Barra en posición alta en la espalda
  * Solo movimiento de piernas (rodillas y cadera)
  * Brazos y hombros estáticos sujetando la barra
  * Codos apuntando hacia abajo

- Front Squat (Sentadilla Frontal):
  * Barra en posición rack frontal
  * Solo movimiento de piernas
  * Codos altos y paralelos al suelo
  * Hombros y brazos mantienen posición estática

Movimientos Combinados:
- Thruster:
  * Inicia como front squat
  * Transición directa a press al subir
  * Los brazos se activan en la extensión de piernas
  * Termina con la barra sobre la cabeza
  * Movimiento fluido y continuo

- Push Press:
  * Pequeño dip de piernas
  * Extensión explosiva para impulsar press
  * No hay squat profundo
  * Enfoque en el press sobre cabeza

Patrones Clave para Diferenciar:
1. Squats (Back/Front):
   - NO hay movimiento activo de brazos
   - Posición de brazos constante durante todo el movimiento
   - Enfoque total en la mecánica de piernas
   - Profundidad completa en la sentadilla

2. Thruster:
   - Combina squat profundo CON press
   - Los brazos se activan durante la extensión
   - Movimiento continuo de abajo hacia arriba
   - Termina con extensión completa sobre cabeza

3. Clean:
   - Inicia desde el suelo o cadera
   - Tirón explosivo
   - Recepción en posición frontal
   - Puede incluir rebote en el fondo

4. Press Movements:
   - Inician desde rack o shoulders
   - Foco en el movimiento de brazos
   - Piernas dan soporte o impulso
   - Terminan sobre cabeza

Proporciona retroalimentación detallada sobre la forma y técnica en español, enfocándote en la coordinación entre extremidades superiores e inferiores.`
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
  const keyFrames = selectKeyFrames(frames);
  
  return `Analiza esta secuencia de movimiento con barra.

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
  - Es Thruster: ${frame.phase === 'press' ? 'Probable' : 'Por Determinar'}
`).join('\n')}

FORMATO REQUERIDO DE RESPUESTA:

1. Identificación del Movimiento
[OBLIGATORIO] Identifica específicamente el movimiento observado basándote en el patrón de movimiento de piernas y brazos:
- Front Squat: SOLO si los codos están altos (>90°) y los brazos mantienen posición frontal fija
- Back Squat: SOLO si los codos están bajos (<90°) y los brazos mantienen posición trasera fija
- Thruster: SOLO si hay un press sobre cabeza claro al final del movimiento
- Push Press: SOLO si hay un dip corto seguido de press

2. Evaluación General
[OBLIGATORIO] Análisis general de la calidad del movimiento, incluyendo:
- Fluidez y timing
- Estabilidad de la posición de la barra
- Profundidad del squat
- Coordinación entre extremidades

3. Recomendaciones Técnicas
[OBLIGATORIO] Lista numerada de aspectos a mejorar

4. Puntuación numérica
[OBLIGATORIO] Calificación de 0 a 100 basada en:
- Técnica general (40%)
- Estabilidad y control (30%)
- Rango de movimiento (30%)

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