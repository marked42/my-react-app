import { Point2D } from './Point2D'

export function isInRange(value: number, start: number, end: number) {
  return value >= Math.min(start, end) && value <= Math.max(start, end)
}

export function isNearPoint(pos1: Point2D, pos2: Point2D) {
  return isCloseToZero(pos1.distance(pos2))
}

const EQUAL_DISTANCE_THRESHOLD = 1
export function isCloseToZero(distance: number) {
  return distance <= EQUAL_DISTANCE_THRESHOLD
}

export function isPositionOnLine(pos: Point2D, start: Point2D, end: Point2D) {
  const lineLength = start.distance(end)
  const startPosLength = start.distance(pos)
  const endPosLength = end.distance(pos)

  const different = Math.abs(startPosLength + endPosLength - lineLength)
  return isCloseToZero(different)
}

export function isPositionOnSquare(pos: Point2D, start: Point2D, end: Point2D) {
  return isInRange(pos.x, start.x, end.x) && isInRange(pos.y, start.y, end.y)
}
