export interface Point {
  x: number;
  y: number;
}

export interface Angles {
  knee: number;
  hip: number;
  shoulder: number;
  elbow: number;
}

/**
 * Calculates the angle between three points in 2D space
 * @param {Point} p1 - First point
 * @param {Point} p2 - Second point (vertex)
 * @param {Point} p3 - Third point
 * @returns {number} Angle in degrees
 */
export function calculateAngle(p1: Point, p2: Point, p3: Point): number {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
  
  const dotProduct = v1.x * v2.x + v1.y * v2.y;
  const magnitude1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const magnitude2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  
  const cosTheta = dotProduct / (magnitude1 * magnitude2);
  const theta = Math.acos(Math.max(-1, Math.min(1, cosTheta)));
  
  return (theta * 180) / Math.PI;
}

/**
 * Calculates key angles for weightlifting analysis
 * @param {Point[]} keypoints - Pose keypoints from MoveNet
 * @returns {Angles} Key angles for analysis
 */
export function calculateKeyAngles(keypoints: Point[]): Angles {
  const angles = {
    knee: calculateAngle(
      keypoints[0], // hip
      keypoints[1], // knee
      keypoints[2]  // ankle
    ),
    hip: calculateAngle(
      keypoints[3], // shoulder
      keypoints[0], // hip
      keypoints[1]  // knee
    ),
    shoulder: calculateAngle(
      keypoints[0], // hip
      keypoints[3], // shoulder
      keypoints[4]  // elbow
    ),
    elbow: calculateAngle(
      keypoints[3], // shoulder
      keypoints[4], // elbow
      keypoints[5]  // wrist
    )
  };
  
  return angles;
}

/**
 * Checks if an angle is within the ideal range
 * @param {number} angle - Current angle
 * @param {number} min - Minimum acceptable angle
 * @param {number} max - Maximum acceptable angle
 * @returns {boolean} True if angle is within range
 */
export function isAngleInRange(angle: number, min: number, max: number): boolean {
  return angle >= min && angle <= max;
} 