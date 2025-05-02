import { MovementData, MovementAnalysis } from '@/types';

export async function analyzeMovement(frames: MovementData[]): Promise<MovementAnalysis> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ frames }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze movement');
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Error analyzing movement:', error);
    throw error;
  }
} 