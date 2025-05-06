'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import VideoUploader from '../../components/VideoUploader';
import VideoAnalyzer from '../../components/VideoAnalyzer';
import MovementFeedback from '../../components/MovementFeedback';
import { AnalysisResult, MovementData } from '../../types';
import Link from 'next/link';

export default function AnalyzePage() {
  const router = useRouter();
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [videoData, setVideoData] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [recordedData, setRecordedData] = useState<MovementData[]>([]);
  const [isUploading, setIsUploading] = useState(true);
  const [isRecordingComplete, setIsRecordingComplete] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Ocultar el navbar global cuando estamos en esta página
  useEffect(() => {
    // Ocultar el navbar global
    const navbar = document.querySelector('nav');
    if (navbar) {
      navbar.style.display = 'none';
    }
    
    // Restaurar el navbar cuando se desmonte el componente
    return () => {
      if (navbar) {
        navbar.style.display = 'block';
      }
    };
  }, []);

  // Verificar autenticación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (!data.authenticated) {
            // Si no está autenticado, redirigir a login
            router.push('/login');
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleVideoReady = (video: HTMLVideoElement, base64Data: string) => {
    console.log('Video ready called with base64 data');
    
    if (!video.src) {
      console.log('No video source provided');
      return;
    }

    // Clean up previous video if exists
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
    }

    // Set new video
    videoRef.current = video;
    setVideoElement(video);
    setVideoData(base64Data);
    setRecordedData([]);
    setAnalysis(null);
    setIsRecordingComplete(false);
    setIsUploading(false);
  };

  const handleAnalysisUpdate = (results: AnalysisResult) => {
    setAnalysis(results);
  };

  const handleRecordingComplete = (data: MovementData[]) => {
    console.log('Recording complete with frames:', data.length);
    setRecordedData(data);
    setIsRecordingComplete(true);
  };

  const handleNewVideo = () => {
    console.log('Handling new video request');
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
    }

    setVideoElement(null);
    setVideoData(null);
    setAnalysis(null);
    setRecordedData([]);
    setIsRecordingComplete(false);
    videoRef.current = null;
    setIsUploading(true);
  };

  const navigateHome = () => {
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-blue-50">
      {/* Navbar propio para esta página */}
      <div className="bg-indigo-800 text-white shadow-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <button onClick={navigateHome} className="flex items-center">
                <span className="text-xl font-bold">AIrnold</span>
              </button>
            </div>
            <div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-16 pb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-indigo-800">
                Análisis de técnica
              </h1>
            </div>
            
            <p className="text-gray-600 max-w-2xl mb-8">
              Sube un vídeo de tu entrenamiento y nuestra IA analizará tu técnica para ofrecerte feedback personalizado.
            </p>
            
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              {isUploading && (
                <div className="p-8">
                  <VideoUploader onVideoReady={handleVideoReady} />
                  
                  <div className="mt-10">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">¿Cómo funciona?</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center mb-3">1</div>
                        <h4 className="font-medium mb-2">Sube tu vídeo</h4>
                        <p className="text-sm text-gray-600">Selecciona un vídeo de hasta 30 segundos donde se pueda ver claramente tu movimiento.</p>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center mb-3">2</div>
                        <h4 className="font-medium mb-2">Análisis en tiempo real</h4>
                        <p className="text-sm text-gray-600">Nuestra IA detectará tus movimientos y analizará la posición de tus articulaciones.</p>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center mb-3">3</div>
                        <h4 className="font-medium mb-2">Recibe feedback</h4>
                        <p className="text-sm text-gray-600">Obtendrás recomendaciones específicas para mejorar tu técnica y prevenir lesiones.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {!isUploading && videoElement && videoData && (
                <div className="p-6">
                  <div className="relative w-full mb-6">
                    <video
                      ref={videoRef}
                      src={videoData}
                      className="w-full rounded-lg shadow-md"
                      controls
                      playsInline
                      style={{ display: 'block' }}
                    />
                    <VideoAnalyzer
                      videoRef={videoRef}
                      onAnalysisUpdate={handleAnalysisUpdate}
                      onRecordingComplete={handleRecordingComplete}
                    />
                  </div>
                  
                  <div className="flex flex-col lg:flex-row gap-6 mb-6">
                    <div className="lg:w-1/3">
                      <button
                        onClick={handleNewVideo}
                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-all transform hover:-translate-y-1 hover:shadow-lg"
                      >
                        Subir nuevo vídeo
                      </button>
                      
                      {analysis && (
                        <div className="mt-6 bg-white border border-indigo-100 rounded-lg p-4 shadow-sm">
                          <h2 className="text-xl font-semibold mb-3 text-indigo-800">Análisis actual</h2>
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-medium text-gray-700">Fase</h3>
                              <p className="capitalize text-indigo-600 font-semibold">{analysis.phase}</p>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-700">Ángulos</h3>
                              <ul className="space-y-1">
                                {Object.entries(analysis.angles).map(([joint, angle]) => (
                                  <li key={joint} className="flex justify-between">
                                    <span className="capitalize text-gray-600">{joint}</span>
                                    <span className="font-mono font-medium">{angle.toFixed(1)}°</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="lg:w-2/3">
                      {isRecordingComplete && recordedData.length > 0 && (
                        <div className="bg-white border border-indigo-100 rounded-lg p-5 shadow-sm">
                          <MovementFeedback analysisFrames={recordedData} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 