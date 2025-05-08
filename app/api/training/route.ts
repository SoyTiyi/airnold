import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { movement, feedback } = await request.json();

    if (!movement || !feedback) {
      return NextResponse.json(
        { error: 'Se requiere el movimiento y el feedback' },
        { status: 400 }
      );
    }

    const prompt = `Como entrenador experto, genera un plan de entrenamiento personalizado basado en el siguiente análisis:

Movimiento analizado: ${movement}
Feedback del movimiento: ${feedback}

Genera un plan de entrenamiento que ayude a mejorar la técnica y abordar las áreas de mejora identificadas.
El plan debe incluir:
1. Un título descriptivo
2. Una breve descripción del objetivo del entrenamiento
3. Una lista de ejercicios específicos, cada uno con:
   - Nombre del ejercicio
   - Número de series
   - Repeticiones recomendadas
   - Notas o consejos de ejecución (opcional)

Responde en formato JSON con la siguiente estructura:
{
  "title": "string",
  "description": "string",
  "exercises": [
    {
      "name": "string",
      "sets": number,
      "reps": "string",
      "notes": "string (opcional)"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Eres un entrenador experto que genera planes de entrenamiento personalizados basados en análisis de movimiento."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    const trainingPlan = JSON.parse(content);

    return NextResponse.json(trainingPlan);
  } catch (error) {
    console.error('Error generando plan de entrenamiento:', error);
    return NextResponse.json(
      { error: 'Error al generar el plan de entrenamiento' },
      { status: 500 }
    );
  }
} 