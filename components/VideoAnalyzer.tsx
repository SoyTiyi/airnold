import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { calculateKeyAngles } from '../utils/angle';
import { detectPhase } from '../utils/phaseDetection';
import { AnalysisResult, Keypoint, MovementData } from '../types';

interface VideoAnalyzerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onAnalysisUpdate: (results: AnalysisResult) => void;
  onRecordingComplete: (movementData: MovementData[]) => void;
}

export default function VideoAnalyzer({ 
  videoRef, 
  onAnalysisUpdate, 
  onRecordingComplete 
}: VideoAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const animationFrameRef = useRef<number>();
  const movementDataRef = useRef<MovementData[]>([]);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const isInitializedRef = useRef(false);

  // Initialize canvas context
  useEffect(() => {
    if (!canvasRef.current) return;
    ctxRef.current = canvasRef.current.getContext('2d');
  }, []);

  // Check video readiness
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const checkVideo = () => {
      if (video.readyState >= 2) {
        console.log('Video ready state check:', {
          readyState: video.readyState,
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration,
          src: video.src
        });
        
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          setIsVideoReady(true);
          video.removeEventListener('loadeddata', checkVideo);
        } else {
          console.log('Video dimensions not yet available');
        }
      }
    };

    video.addEventListener('loadeddata', checkVideo);
    // Check immediately in case the video is already loaded
    checkVideo();

    return () => {
      video.removeEventListener('loadeddata', checkVideo);
    };
  }, [videoRef.current]);

  // Initialize TensorFlow and detector
  useEffect(() => {
    if (isInitializedRef.current) return;

    async function initializeDetector() {
      try {
        console.log('Initializing TensorFlow...');
        await tf.ready();
        console.log('Setting backend...');
        await tf.setBackend('webgl');
        console.log('Creating detector...');
        
        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
          }
        );
        console.log('Detector created successfully');
        detectorRef.current = detector;
        isInitializedRef.current = true;
      } catch (error) {
        console.error('Error initializing pose detector:', error);
      }
    }

    initializeDetector();

    return () => {
      if (detectorRef.current) {
        detectorRef.current.dispose();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      isInitializedRef.current = false;
    };
  }, []);

  // Initialize canvas when video is ready
  useEffect(() => {
    if (!isVideoReady || !videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    // Set canvas dimensions to match video display size
    const updateCanvasSize = () => {
      const rect = video.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      console.log('Canvas initialized with dimensions:', {
        width: canvas.width,
        height: canvas.height,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        rectWidth: rect.width,
        rectHeight: rect.height
      });
    };

    updateCanvasSize();
    
    // Update canvas size when video dimensions change
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(video);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isVideoReady]);

  // Handle video recording
  useEffect(() => {
    if (!isRecording || !isVideoReady || !detectorRef.current || !videoRef.current) {
      return;
    }

    let isRunning = true;
    let lastFrameTime = 0;
    const FPS = 60;
    const frameInterval = 1000 / FPS;

    const recordFrame = async (timestamp: number) => {
      if (!isRunning || !videoRef.current) return;

      if (videoRef.current.paused || videoRef.current.ended) {
        console.log('Recording completed');
        setIsRecording(false);
        onRecordingComplete(movementDataRef.current);
        return;
      }

      const elapsed = timestamp - lastFrameTime;
      
      if (elapsed > frameInterval) {
        try {
          const frameData = await captureFrame();
          if (frameData) {
            movementDataRef.current.push(frameData);
            onAnalysisUpdate({
              angles: frameData.angles,
              phase: frameData.phase,
              keypoints: frameData.keypoints
            });
          }
          lastFrameTime = timestamp;
        } catch (error) {
          console.error('Error in frame capture:', error);
          return;
        }
      }

      if (isRecording && isRunning) {
        animationFrameRef.current = requestAnimationFrame(recordFrame);
      }
    };

    const cleanup = () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      onRecordingComplete(movementDataRef.current);
    };

    videoRef.current.addEventListener('ended', cleanup);
    videoRef.current.addEventListener('pause', cleanup);

    animationFrameRef.current = requestAnimationFrame(recordFrame);

    return () => {
      cleanup();
      if (videoRef.current) {
        videoRef.current.removeEventListener('ended', cleanup);
        videoRef.current.removeEventListener('pause', cleanup);
      }
    };
  }, [isRecording, isVideoReady]);

  const processKeypoints = (keypoints: poseDetection.Keypoint[]): Keypoint[] => {
    return keypoints.map(kp => ({
      x: kp.x,
      y: kp.y,
      score: kp.score ?? 0,
      name: kp.name
    }));
  };

  async function captureFrame(): Promise<MovementData | null> {
    if (!detectorRef.current || !videoRef.current || !canvasRef.current || !ctxRef.current) {
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    try {
      const poses = await detectorRef.current.estimatePoses(video);
      if (!poses[0]) return null;

      const videoRect = video.getBoundingClientRect();
      canvas.width = videoRect.width;
      canvas.height = videoRect.height;

      const scaleX = canvas.width / video.videoWidth;
      const scaleY = canvas.height / video.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const processedKeypoints = processKeypoints(poses[0].keypoints);
      
      // Draw keypoints and skeleton
      drawPose(ctx, processedKeypoints, scaleX, scaleY);

      const angles = calculateKeyAngles(processedKeypoints);
      const phase = detectPhase(processedKeypoints, []);

      return {
        timestamp: video.currentTime,
        keypoints: processedKeypoints,
        angles,
        phase
      };
    } catch (error) {
      console.error('Error capturing frame:', error);
      return null;
    }
  }

  function drawPose(
    ctx: CanvasRenderingContext2D, 
    keypoints: Keypoint[], 
    scaleX: number, 
    scaleY: number
  ) {
    // Draw keypoints
    keypoints.forEach(keypoint => {
      if (keypoint.score > 0.3) {
        const x = keypoint.x * scaleX;
        const y = keypoint.y * scaleY;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      }
    });

    // Draw skeleton
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 2;

    const skeleton = [
      [5, 7], [7, 9], [6, 8], [8, 10], [5, 6], [5, 11], [6, 12],
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16]
    ];

    skeleton.forEach(([i, j]) => {
      const kp1 = keypoints[i];
      const kp2 = keypoints[j];

      if (kp1?.score > 0.3 && kp2?.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(kp1.x * scaleX, kp1.y * scaleY);
        ctx.lineTo(kp2.x * scaleX, kp2.y * scaleY);
        ctx.stroke();
      }
    });
  }

  const startRecording = () => {
    if (!isVideoReady || !videoRef.current) return;
    
    try {
      movementDataRef.current = [];
      if (videoRef.current.paused) {
        videoRef.current.play()
          .then(() => {
            setIsRecording(true);
          })
          .catch(error => {
            console.error('Error playing video:', error);
          });
      } else {
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    try {
      setIsRecording(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
      onRecordingComplete(movementDataRef.current);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  return (
    <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      />
      <div 
        className="absolute bottom-4 left-4"
        style={{ 
          zIndex: 40,
          pointerEvents: 'auto'
        }}
      >
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={!isVideoReady}
            className={`px-4 py-2 rounded ${
              isVideoReady 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            } shadow-lg`}
          >
            {isVideoReady ? 'Start Recording' : 'Loading...'}
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 shadow-lg"
          >
            Stop Recording
          </button>
        )}
      </div>
    </div>
  );
} 