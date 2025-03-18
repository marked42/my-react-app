import { Point2D } from './Point2D'
import { Text } from '../GraphElement'
import { CANVAS_FONT, CANVAS_FONT_SIZE } from '../const'
import { Offset } from './Offset'

export function isInRange(value: number, start: number, end: number) {
  return value >= Math.min(start, end) && value <= Math.max(start, end)
}

export function isNearPoint(pos1: Point2D, pos2: Point2D) {
  return isCloseToZero(pos1.distance(pos2))
}

const EQUAL_DISTANCE_THRESHOLD = 1
export function isCloseToZero(
  distance: number,
  epsilon = EQUAL_DISTANCE_THRESHOLD
) {
  return distance <= epsilon
}

export function isPositionOnLine(
  pos: Point2D,
  start: Point2D,
  end: Point2D,
  epsilon = EQUAL_DISTANCE_THRESHOLD
) {
  const lineLength = start.distance(end)
  const startPosLength = start.distance(pos)
  const endPosLength = end.distance(pos)

  const different = Math.abs(startPosLength + endPosLength - lineLength)
  return isCloseToZero(different, epsilon)
}

export function isPositionOnSquare(pos: Point2D, start: Point2D, end: Point2D) {
  return isInRange(pos.x, start.x, end.x) && isInRange(pos.y, start.y, end.y)
}

/**
 * measureText width as single line, height as fixed font-size
 */
export function isPointOnText(
  pos: Point2D,
  textElement: Text,
  context: CanvasRenderingContext2D
) {
  const { position: start, text } = textElement
  const textWidth = context.measureText(text).width

  const LINE_HEIGHT = CANVAS_FONT_SIZE
  const end = start.offsetBy(Offset.of(textWidth, LINE_HEIGHT))

  return isPositionOnSquare(pos, start, end)
}
