export interface Keypoint {
  x: number;
  y: number;
  score: number;
  name?: string;
}

export interface Angles {
  knee: number;
  hip: number;
  shoulder: number;
  elbow: number;
}

export type Phase = 'descent' | 'drive' | 'reception' | 'press' | 'squat_bottom' | 'front_squat_bottom' | 'back_squat_bottom' | 'front_drive' | 'back_drive' | 'unknown';

export interface AnalysisResult {
  angles: Angles;
  phase: Phase;
  keypoints: Keypoint[];
}

export interface MovementData {
  timestamp: number;
  keypoints: Keypoint[];
  angles: Angles;
  phase: Phase;
}

export interface MovementAnalysis {
  movement: string;
  feedback: string;
  recommendations: string[];
  score: number;
} 