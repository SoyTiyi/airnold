import { useState } from 'react';
import { MovementData, MovementAnalysis } from '../types';
import { analyzeMovement } from '../utils/movementAnalysis';

interface MovementFeedbackProps {
  analysisFrames: MovementData[];
}

interface TrainingResponse {
  title: string;
  description: string;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    notes?: string;
  }[];
}

export default function MovementFeedback({ analysisFrames }: MovementFeedbackProps) {
  const [analysis, setAnalysis] = useState<MovementAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [trainingPlan, setTrainingPlan] = useState<TrainingResponse | null>(null);
  const [loadingTraining, setLoadingTraining] = useState(false);

  const handleAnalyze = async () => {
    if (analysisFrames.length === 0) {
      setError('No hay datos de movimiento para analizar');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await analyzeMovement(analysisFrames);
      
      if (!result) {
        setError('No se recibió respuesta del servicio de análisis');
        return;
      }
      
      if (result.movement === "Movimiento no identificado" && result.feedback === "No se pudo analizar el movimiento") {
        setError('El análisis no pudo identificar el movimiento. Por favor, intenta con otro vídeo o movimiento más claro.');
        return;
      }
      
      setAnalysis(result);
    } catch (err) {
      console.error('Error en análisis:', err);
      setError('Error al analizar el movimiento. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTraining = async () => {
    if (!analysis) return;

    try {
      setLoadingTraining(true);
      setError(null);

      const response = await fetch('/api/training', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movement: analysis.movement,
          feedback: analysis.feedback,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar el entrenamiento');
      }

      const trainingData = await response.json();
      setTrainingPlan(trainingData);
      setShowTrainingModal(true);
    } catch (err) {
      console.error('Error generando entrenamiento:', err);
      setError('Error al generar el entrenamiento. Por favor, intenta de nuevo.');
    } finally {
      setLoadingTraining(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatFeedback = (feedback: string) => {
    if (!feedback || feedback === "No se pudo analizar el movimiento") {
      return <p className="text-gray-700">No hay feedback disponible</p>;
    }
    
    // Dividir el feedback en párrafos
    const paragraphs = feedback.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Buscar formato markdown para títulos (**Título**)
      const titleMatch = paragraph.match(/\*\*([^*]+)\*\*:\s*(.*)/);
      
      if (titleMatch) {
        const [_, title, content] = titleMatch;
        
        return (
          <div key={index} className="mb-4">
            <h4 className="font-bold text-indigo-800 mb-1">{title}</h4>
            <p className="text-gray-700">{content}</p>
          </div>
        );
      }
      
      // Texto normal sin formato especial
      return <p key={index} className="mb-2 text-gray-700">{paragraph}</p>;
    });
  };

  const formatMovementName = (movement: string) => {
    // Verify if we have multiple repetitions
    if (movement.includes('Repetición')) {
      const lines = movement.split('\n').map((line, index) => (
        <div key={index} className="flex items-center mb-1 last:mb-0">
          <div className="w-6 h-6 flex-shrink-0 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center mr-2">
            {index + 1}
          </div>
          <span>{line}</span>
        </div>
      ));
      
      return <div className="space-y-1">{lines}</div>;
    }
    
    // Single movement (fallback)
    return <p className="text-indigo-700 font-semibold">{movement}</p>;
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-xl text-indigo-800 font-bold">Análisis Detallado</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">
            {analysisFrames.length} frames capturados
          </span>
          <button
            onClick={handleAnalyze}
            disabled={loading || analysisFrames.length === 0}
            className={`px-5 py-2 rounded-lg font-medium ${
              loading || analysisFrames.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:shadow-md transition-all'
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analizando...
              </span>
            ) : 'Analizar Movimiento'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {analysis ? (
        <div className="space-y-6">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-indigo-800">Movimiento Detectado</h3>
            </div>
            {formatMovementName(analysis.movement)}
          </div>

          <div className="bg-white border border-gray-100 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Feedback General</h3>
            <div className="space-y-1">
              {formatFeedback(analysis.feedback)}
            </div>
            <div className="mt-6">
              <button
                onClick={handleGenerateTraining}
                disabled={loadingTraining}
                className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium ${
                  loadingTraining
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transition-all transform hover:-translate-y-0.5'
                }`}
              >
                {loadingTraining ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generando entrenamiento...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Generar Plan de Entrenamiento
                  </span>
                )}
              </button>
            </div>
          </div>

          {analysis.recommendations && analysis.recommendations.length > 0 ? (
            <div className="bg-white border border-gray-100 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Recomendaciones</h3>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center mr-2">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="bg-white border border-gray-100 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Puntuación</h3>
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${getScoreColor(analysis.score)} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${analysis.score}%` }}
                  ></div>
                </div>
                <span className="text-lg font-bold">{analysis.score}%</span>
              </div>
              <p className="text-sm text-gray-600 italic">
                {analysis.score >= 80 
                  ? '¡Excelente técnica! Sigue así.' 
                  : analysis.score >= 60 
                    ? 'Buena técnica, pero hay margen de mejora.' 
                    : 'Necesitas mejorar tu técnica para prevenir posibles lesiones.'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-lg text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-indigo-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="text-lg font-semibold text-indigo-800 mb-2">Análisis no disponible</h3>
          <p className="text-gray-600 mb-4">
            Haz clic en el botón "Analizar Movimiento" para obtener un análisis detallado de tu técnica.
          </p>
        </div>
      )}

      {/* Modal de Plan de Entrenamiento */}
      {showTrainingModal && trainingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-indigo-800">{trainingPlan.title}</h2>
                <button
                  onClick={() => setShowTrainingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-gray-600 mb-6">{trainingPlan.description}</p>
              
              <div className="space-y-4">
                {trainingPlan.exercises.map((exercise, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2">{exercise.name}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Series:</span>
                        <span className="ml-2 font-medium">{exercise.sets}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Repeticiones:</span>
                        <span className="ml-2 font-medium">{exercise.reps}</span>
                      </div>
                    </div>
                    {exercise.notes && (
                      <p className="mt-2 text-sm text-gray-600">{exercise.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 