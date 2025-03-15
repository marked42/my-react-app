export interface Point2D {
  x: number
  y: number
}

export interface Movement {
  x: number
  y: number
}

export function isInRange(value: number, start: number, end: number) {
  return value >= Math.min(start, end) && value <= Math.max(start, end)
}

export function isNearPoint(pos1: Point2D, pos2: Point2D) {
  return isCloseToZero(distance(pos1, pos2))
}

const EQUAL_DISTANCE_THRESHOLD = 1
export function isCloseToZero(distance: number) {
  return distance <= EQUAL_DISTANCE_THRESHOLD
}

export function distance(pos1: Point2D, pos2: Point2D) {
  return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2))
}

export function isPositionOnLine(pos: Point2D, start: Point2D, end: Point2D) {
  const lineLength = distance(start, end)
  const startPosLength = distance(start, pos)
  const endPosLength = distance(end, pos)

  const different = Math.abs(startPosLength + endPosLength - lineLength)
  return isCloseToZero(different)
}

export function isPositionOnSquare(pos: Point2D, start: Point2D, end: Point2D) {
  return isInRange(pos.x, start.x, end.x) && isInRange(pos.y, start.y, end.y)
}

export function getMovement(start: Point2D, end: Point2D): Movement {
  return { x: end.x - start.x, y: end.y - start.y }
}
