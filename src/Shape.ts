export enum ShapeType {
  Line,
  Square,
  Text,
}

interface BaseShape {
  id: number
}

export interface Position {
  x: number
  y: number
}

export interface Movement {
  x: number
  y: number
}

interface Line extends BaseShape {
  type: ShapeType.Line
  start: Position
  end: Position
}

interface Square extends BaseShape {
  type: ShapeType.Square
  start: Position
  end: Position
}

interface Text extends BaseShape {
  type: ShapeType.Text
  position: Position
  text: string
}

export type Shape = Line | Square | Text

let id = 0
export function nextShapeId() {
  id++
  return id
}

export function createLine(start: Position, end: Position): Line {
  return {
    id: nextShapeId(),
    type: ShapeType.Line,
    start,
    end,
  }
}

export function createSquare(start: Position, end: Position): Square {
  return {
    id: nextShapeId(),
    type: ShapeType.Square,
    start,
    end,
  }
}

export function createText(position: Position, text: string): Text {
  return {
    id: nextShapeId(),
    type: ShapeType.Text,
    position,
    text,
  }
}

export const EQUAL_DISTANCE_THRESHOLD = 1

export function isPositionOnLine(line: Line, pos: Position) {
  const lineLength = distance(line.start, line.end)
  const startPosLength = distance(line.start, pos)
  const endPosLength = distance(line.end, pos)

  const different = Math.abs(startPosLength + endPosLength - lineLength)
  return isCloseToZero(different)
}

export function isPositionOnSquare(
  pos: Position,
  start: Position,
  end: Position
) {
  return isInRange(pos.x, start.x, end.x) && isInRange(pos.y, start.y, end.y)
}

export function isInRange(value: number, start: number, end: number) {
  return value >= Math.min(start, end) && value <= Math.max(start, end)
}

export function isCloseToZero(distance: number) {
  return distance <= EQUAL_DISTANCE_THRESHOLD
}

export function isNearPoint(pos1: Position, pos2: Position) {
  return isCloseToZero(distance(pos1, pos2))
}

export function distance(pos1: Position, pos2: Position) {
  return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2))
}

// move shape in place
export function moveShape(shape: Shape, movement: Movement) {
  switch (shape.type) {
    case ShapeType.Line:
    case ShapeType.Square: {
      const { start, end, ...rest } = shape
      return {
        start: movePoint(start, movement),
        end: movePoint(end, movement),
        ...rest,
      }
    }
    case ShapeType.Text: {
      const { position, ...rest } = shape
      return {
        position: movePoint(position, movement),
        ...rest,
      }
    }
  }

  throw new Error('unimplemented moveShape case')
}

// export function moveShape(shape: Shape, movement: Movement) {
//   switch (shape.type) {
//     case ShapeType.Line:
//     case ShapeType.Square: {
//       console.log('before move', shape.start, shape.end, movement)
//       shape.start = movePoint(shape.start, movement)
//       shape.end = movePoint(shape.end, movement)
//       console.log('after move', shape.start, shape.end, movement)
//       return
//     }
//     case ShapeType.Text: {
//       console.log('before position', shape.position, movement)
//       shape.position = movePoint(shape.position, movement)
//       console.log('after position', shape.position, movement)
//       return
//     }
//   }

//   throw new Error('unimplemented moveShape case')
// }

export function movePoint(point: Position, movement: Movement) {
  return {
    x: point.x + movement.x,
    y: point.y + movement.y,
  }
}

export function getMovement(start: Position, end: Position): Movement {
  return { x: end.x - start.x, y: end.y - start.y }
}
