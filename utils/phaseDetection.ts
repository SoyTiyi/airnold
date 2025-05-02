import { calculateAngle, calculateKeyAngles, isAngleInRange } from './angle';

interface Point {
  x: number;
  y: number;
}

interface Angles {
  knee: number;
  hip: number;
  shoulder: number;
  elbow: number;
}

interface PhaseData {
  start: number | null;
  end: number | null;
  angles: Angles[];
}

interface PhaseResults {
  [key: string]: {
    duration: number;
    avgAngles: Angles;
    timeInRange: {
      knee: number;
      hip: number;
      shoulder: number;
      elbow: number;
    };
    isSquat: boolean;
    isThruster: boolean;
    isFrontSquat: boolean;
    isBackSquat: boolean;
  };
}

export type Phase = 'descent' | 'drive' | 'reception' | 'press' | 'squat_bottom' | 'front_squat_bottom' | 'back_squat_bottom' | 'front_drive' | 'back_drive';

/**
 * Detects the current phase of a weightlifting movement
 * @param {Point[]} keypoints - Current pose keypoints
 * @param {Point[][]} history - Array of previous keypoints
 * @returns {Phase} Current phase
 */
export function detectPhase(keypoints: Point[], history: Point[][]): Phase {
  const kneeAngle = calculateAngle(
    keypoints[0], // hip
    keypoints[1], // knee
    keypoints[2]  // ankle
  );
  
  const hipAngle = calculateAngle(
    keypoints[3], // shoulder
    keypoints[0], // hip
    keypoints[1]  // knee
  );

  const shoulderAngle = calculateAngle(
    keypoints[0], // hip
    keypoints[3], // shoulder
    keypoints[4]  // elbow
  );

  const elbowAngle = calculateAngle(
    keypoints[3], // shoulder
    keypoints[4], // elbow
    keypoints[5]  // wrist
  );
  
  // Calculate vertical velocities
  const hipVelocity = history.length > 0
    ? keypoints[0].y - history[history.length - 1][0].y
    : 0;

  const shoulderVelocity = history.length > 0
    ? keypoints[3].y - history[history.length - 1][3].y
    : 0;

  // Check for arm movement relative to shoulders
  const isArmMoving = Math.abs(shoulderVelocity) > 0.05;
  
  // Determine bar position based on elbow and shoulder angles
  const isFrontRack = elbowAngle > 90 && shoulderAngle < 100;
  const isBackRack = elbowAngle < 90 && shoulderAngle > 100;
  
  // Phase detection logic with arm movement consideration
  if (hipVelocity > 0.1) {
    if (isArmMoving && shoulderAngle > 120) {
      return 'press'; // Moving upward with arm press (thruster)
    }
    if (isFrontRack) {
      return 'front_drive'; // Front squat drive phase
    }
    if (isBackRack) {
      return 'back_drive'; // Back squat drive phase
    }
    return 'drive'; // Generic drive phase
  } else if (kneeAngle < 90 && hipAngle < 90) {
    if (shoulderAngle < 100 && !isArmMoving) {
      if (isFrontRack) {
        return 'front_squat_bottom'; // Front squat bottom position
      }
      if (isBackRack) {
        return 'back_squat_bottom'; // Back squat bottom position
      }
      return 'squat_bottom'; // Generic squat bottom
    }
    return 'descent'; // General descent phase
  } else {
    return 'reception'; // Catching or receiving position
  }
}

/**
 * Analyzes a complete lift sequence
 * @param {Point[][]} keypointsHistory - Array of keypoints over time
 * @returns {PhaseResults} Analysis results
 */
export function analyzeLiftSequence(keypointsHistory: Point[][]): PhaseResults {
  const phases: Record<Phase, PhaseData> = {
    descent: { start: null, end: null, angles: [] },
    drive: { start: null, end: null, angles: [] },
    reception: { start: null, end: null, angles: [] },
    press: { start: null, end: null, angles: [] },
    squat_bottom: { start: null, end: null, angles: [] },
    front_squat_bottom: { start: null, end: null, angles: [] },
    back_squat_bottom: { start: null, end: null, angles: [] },
    front_drive: { start: null, end: null, angles: [] },
    back_drive: { start: null, end: null, angles: [] }
  };

  let currentPhase: Phase | null = null;
  let armMovementDetected = false;
  let stableArmCount = 0;
  let totalFrames = 0;
  let frontRackCount = 0;
  let backRackCount = 0;
  
  keypointsHistory.forEach((keypoints, index) => {
    const phase = detectPhase(keypoints, keypointsHistory.slice(0, index));
    totalFrames++;
    
    // Track arm stability and rack position
    if (index > 0) {
      const prevShoulder = keypointsHistory[index - 1][3];
      const currentShoulder = keypoints[3];
      const shoulderMovement = Math.abs(currentShoulder.y - prevShoulder.y);
      
      if (shoulderMovement < 0.05) {
        stableArmCount++;
      }
      if (shoulderMovement > 0.1) {
        armMovementDetected = true;
      }

      // Track rack position
      const elbowAngle = calculateAngle(
        keypoints[3], // shoulder
        keypoints[4], // elbow
        keypoints[5]  // wrist
      );
      const shoulderAngle = calculateAngle(
        keypoints[0], // hip
        keypoints[3], // shoulder
        keypoints[4]  // elbow
      );

      if (elbowAngle > 90 && shoulderAngle < 100) {
        frontRackCount++;
      } else if (elbowAngle < 90 && shoulderAngle > 100) {
        backRackCount++;
      }
    }
    
    if (phase !== currentPhase) {
      if (currentPhase) {
        phases[currentPhase].end = index;
      }
      phases[phase].start = index;
      currentPhase = phase;
    }
    
    const angles = calculateKeyAngles(keypoints);
    phases[phase].angles.push(angles);
  });
  
  // Calculate phase statistics with arm movement consideration
  const results: PhaseResults = {};
  Object.entries(phases).forEach(([phase, data]) => {
    if (data.start !== null && data.end !== null) {
      const duration = data.end - data.start;
      const avgAngles = calculateAverageAngles(data.angles);
      const armStabilityRatio = stableArmCount / totalFrames;
      const frontRackRatio = frontRackCount / totalFrames;
      const backRackRatio = backRackCount / totalFrames;
      
      results[phase] = {
        duration,
        avgAngles,
        timeInRange: calculateTimeInRange(data.angles),
        isSquat: armStabilityRatio > 0.8 && !armMovementDetected,
        isThruster: armMovementDetected && phases['press'].angles.length > 0,
        isFrontSquat: frontRackRatio > 0.7 && !armMovementDetected,
        isBackSquat: backRackRatio > 0.7 && !armMovementDetected
      };
    }
  });
  
  return results;
}

/**
 * Calculates average angles for a set of keypoints
 * @param {Angles[]} anglesArray - Array of angle measurements
 * @returns {Angles} Average angles
 */
function calculateAverageAngles(anglesArray: Angles[]): Angles {
  const sums = {
    knee: 0,
    hip: 0,
    shoulder: 0,
    elbow: 0
  };
  
  anglesArray.forEach(angles => {
    Object.keys(sums).forEach(key => {
      sums[key as keyof Angles] += angles[key as keyof Angles];
    });
  });
  
  const averages: Angles = {
    knee: sums.knee / anglesArray.length,
    hip: sums.hip / anglesArray.length,
    shoulder: sums.shoulder / anglesArray.length,
    elbow: sums.elbow / anglesArray.length
  };
  
  return averages;
}

/**
 * Calculates percentage of time angles were in ideal range
 * @param {Angles[]} anglesArray - Array of angle measurements
 * @returns {Object} Percentage of time in range for each joint
 */
function calculateTimeInRange(anglesArray: Angles[]): {
  knee: number;
  hip: number;
  shoulder: number;
  elbow: number;
} {
  const idealRanges = {
    knee: { min: 90, max: 120 },
    hip: { min: 90, max: 120 },
    shoulder: { min: 45, max: 90 },
    elbow: { min: 90, max: 180 }
  };
  
  const inRangeCounts = {
    knee: 0,
    hip: 0,
    shoulder: 0,
    elbow: 0
  };
  
  anglesArray.forEach(angles => {
    Object.keys(idealRanges).forEach(key => {
      const joint = key as keyof typeof idealRanges;
      if (isAngleInRange(angles[joint], idealRanges[joint].min, idealRanges[joint].max)) {
        inRangeCounts[joint]++;
      }
    });
  });
  
  const percentages = {
    knee: (inRangeCounts.knee / anglesArray.length) * 100,
    hip: (inRangeCounts.hip / anglesArray.length) * 100,
    shoulder: (inRangeCounts.shoulder / anglesArray.length) * 100,
    elbow: (inRangeCounts.elbow / anglesArray.length) * 100
  };
  
  return percentages;
} 