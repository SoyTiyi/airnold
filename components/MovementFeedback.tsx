import { useState } from 'react';
import { MovementData, MovementAnalysis } from '../types';
import { analyzeMovement } from '../utils/movementAnalysis';

interface MovementFeedbackProps {
  analysisFrames: MovementData[];
}

export default function MovementFeedback({ analysisFrames }: MovementFeedbackProps) {
  const [analysis, setAnalysis] = useState<MovementAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (analysisFrames.length === 0) {
      setError('No hay datos de movimiento para analizar');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await analyzeMovement(analysisFrames);
      setAnalysis(result);
    } catch (err) {
      setError('Error al analizar el movimiento. Por favor, intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Análisis Detallado</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {analysisFrames.length} frames capturados
          </span>
          <button
            onClick={handleAnalyze}
            disabled={loading || analysisFrames.length === 0}
            className={`px-4 py-2 rounded ${
              loading || analysisFrames.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors`}
          >
            {loading ? 'Analizando...' : 'Analizar Movimiento'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {analysis && (
        <div className="mt-4">
          <div className="mb-4">
            <h3 className="font-medium mb-2">Movimiento Detectado</h3>
            <p className="text-gray-700 font-semibold">{analysis.movement}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-medium mb-2">Feedback General</h3>
            <p className="text-gray-700">{analysis.feedback}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-medium mb-2">Recomendaciones</h3>
            <ul className="list-decimal pl-5">
              {analysis.recommendations.map((rec, index) => (
                <li key={index} className="text-gray-700 mb-1">{rec}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">Puntuación</h3>
            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${analysis.score}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{analysis.score}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 