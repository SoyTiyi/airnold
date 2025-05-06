import { useRef, useState, useEffect } from 'react';

interface VideoUploaderProps {
  onVideoReady: (video: HTMLVideoElement, videoData: string) => void;
}

export default function VideoUploader({ onVideoReady }: VideoUploaderProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Por favor, sube un archivo de vídeo válido');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setVideoFile(file);

      // Convert video to base64
      const base64Data = await convertFileToBase64(file);
      
      // Create video element for preview
      const video = document.createElement('video');
      video.src = base64Data;
      video.onloadedmetadata = () => {
        if (video.duration > 30) {
          setError('El vídeo debe durar menos de 30 segundos');
          setVideoFile(null);
          setIsLoading(false);
          return;
        }

        // Create a new video element for the parent component
        const videoElement = document.createElement('video');
        videoElement.src = base64Data;
        videoElement.onloadedmetadata = () => {
          onVideoReady(videoElement, base64Data);
        };
      };
    } catch (err) {
      console.error('Error processing video:', err);
      setError('Error al procesar el vídeo. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div 
        className={`w-full border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
          id="video-upload"
          disabled={isLoading}
        />

        <div className="flex flex-col items-center justify-center">
          <div className="mb-4">
            {isLoading ? (
              <svg className="animate-spin h-12 w-12 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-16 w-16 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {isLoading ? 'Procesando vídeo...' : 'Selecciona o arrastra un vídeo'}
          </h3>
          
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            Graba tu entrenamiento con la cámara de tu dispositivo o selecciona un archivo de vídeo existente.
          </p>
          
          <button
            type="button"
            className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-medium py-3 px-6 rounded-lg shadow-md transition transform hover:-translate-y-0.5 hover:shadow-lg"
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : 'Seleccionar vídeo'}
          </button>
          
          <p className="mt-4 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Duración máxima: 30 segundos
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {videoFile && !error && (
        <div className="mt-4 flex items-center justify-center p-3 bg-indigo-50 rounded-lg">
          <svg className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-indigo-700 font-medium">{videoFile.name}</span>
        </div>
      )}
    </div>
  );
} 