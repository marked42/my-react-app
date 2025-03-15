import { Movement, Point2D } from './Geometry'

export enum ShapeType {
  Line,
  Square,
  Text,
}

interface BaseShape {
  id: number
}

interface Line extends BaseShape {
  type: ShapeType.Line
  start: Point2D
  end: Point2D
}

interface Square extends BaseShape {
  type: ShapeType.Square
  start: Point2D
  end: Point2D
}

interface Text extends BaseShape {
  type: ShapeType.Text
  position: Point2D
  text: string
}

export type Shape = Line | Square | Text

let id = 0
export function nextShapeId() {
  id++
  return id
}

export function createLine(start: Point2D, end: Point2D): Line {
  return {
    id: nextShapeId(),
    type: ShapeType.Line,
    start,
    end,
  }
}

export function createSquare(start: Point2D, end: Point2D): Square {
  return {
    id: nextShapeId(),
    type: ShapeType.Square,
    start,
    end,
  }
}

export function createText(position: Point2D, text: string): Text {
  return {
    id: nextShapeId(),
    type: ShapeType.Text,
    position,
    text,
  }
}

export function copyMoveShape(shape: Shape, movement: Movement) {
  switch (shape.type) {
    case ShapeType.Line:
    case ShapeType.Square: {
      const { start, end, ...rest } = shape
      return {
        start: copyMovePoint(start, movement),
        end: copyMovePoint(end, movement),
        ...rest,
      }
    }
    case ShapeType.Text: {
      const { position, ...rest } = shape
      return {
        position: copyMovePoint(position, movement),
        ...rest,
      }
    }
  }

  throw new Error('unimplemented copyMoveShape case')
}

export function copyMovePoint(point: Point2D, movement: Movement): Point2D {
  return {
    x: point.x + movement.x,
    y: point.y + movement.y,
  }
}
