import { MovementData, MovementAnalysis } from '@/types';

export async function analyzeMovement(frames: MovementData[]): Promise<MovementAnalysis> {
  try {
    console.log(`Enviando petición de análisis con ${frames.length} frames`);
    
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ frames }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error en respuesta API: ${response.status} - ${errorText}`);
      throw new Error(`Error del servidor: ${response.status} - ${errorText.substring(0, 100)}`);
    }

    const data = await response.json();
    
    // Add validation for the expected data structure
    if (!data || !data.analysis) {
      console.error('La respuesta de API no contiene datos de análisis:', data);
      throw new Error('La respuesta del servidor no contiene datos de análisis');
    }
    
    console.log('Respuesta de análisis recibida:', data.analysis);
    return data.analysis;
  } catch (error) {
    console.error('Error en análisis de movimiento:', error);
    
    // Return a default error result instead of throwing
    return {
      movement: "Error en análisis",
      feedback: "Ocurrió un error al procesar el movimiento. Por favor, intenta de nuevo.",
      recommendations: [],
      score: 0
    };
  }
} 