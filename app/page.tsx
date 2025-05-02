'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import VideoUploader from '../components/VideoUploader';
import VideoAnalyzer from '../components/VideoAnalyzer';
import MovementFeedback from '../components/MovementFeedback';
import { AnalysisResult, MovementData } from '../types';

export default function Home() {
  const router = useRouter();
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [videoData, setVideoData] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [recordedData, setRecordedData] = useState<MovementData[]>([]);
  const [isUploading, setIsUploading] = useState(true);
  const [isRecordingComplete, setIsRecordingComplete] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">
            AIrnold - CrossFit Technique Analysis
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
        
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          {isUploading && (
            <div className="mb-8">
              <VideoUploader onVideoReady={handleVideoReady} />
            </div>
          )}
          
          {!isUploading && videoElement && videoData && (
            <>
              <div className="relative w-full">
                <video
                  ref={videoRef}
                  src={videoData}
                  className="w-full rounded-lg shadow-lg"
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
              
              <div className="mt-4 flex justify-between items-start gap-4">
                <button
                  onClick={handleNewVideo}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors shadow-lg"
                >
                  Upload New Video
                </button>
                {analysis && (
                  <div className="flex-1 p-4 bg-white rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-2">Current Analysis</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium">Phase</h3>
                        <p className="capitalize">{analysis.phase}</p>
                      </div>
                      <div>
                        <h3 className="font-medium">Angles</h3>
                        <ul>
                          {Object.entries(analysis.angles).map(([joint, angle]) => (
                            <li key={joint} className="text-sm">
                              <span className="capitalize">{joint}</span>: {angle.toFixed(1)}°
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {isRecordingComplete && recordedData.length > 0 && (
                <MovementFeedback analysisFrames={recordedData} />
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
} 