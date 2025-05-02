import { useRef, useState, useEffect } from 'react';

interface VideoUploaderProps {
  onVideoReady: (video: HTMLVideoElement, videoData: string) => void;
}

export default function VideoUploader({ onVideoReady }: VideoUploaderProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Please upload a video file');
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
          setError('Video must be less than 30 seconds');
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
      setError('Error processing video. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
          id="video-upload"
          disabled={isLoading}
        />
        <label
          htmlFor="video-upload"
          className={`cursor-pointer ${
            isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          } text-white px-4 py-2 rounded inline-block transition-colors`}
        >
          {isLoading ? 'Processing...' : 'Select Video'}
        </label>
        <p className="mt-2 text-sm text-gray-500">
          Maximum duration: 30 seconds
        </p>
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>

      {videoFile && !error && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Selected video: {videoFile.name}
        </div>
      )}
    </div>
  );
} 