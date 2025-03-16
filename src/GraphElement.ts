import { Movement, Point2D } from './Geometry'

export enum GraphElementType {
  Line,
  Square,
  Text,
}

interface BaseGraphElement {
  id: number
}

interface Line extends BaseGraphElement {
  type: GraphElementType.Line
  start: Point2D
  end: Point2D
}

interface Square extends BaseGraphElement {
  type: GraphElementType.Square
  start: Point2D
  end: Point2D
}

interface Text extends BaseGraphElement {
  type: GraphElementType.Text
  position: Point2D
  text: string
}

export type GraphElement = Line | Square | Text

let id = 0
export function nextId() {
  id++
  return id
}

export function createLine(start: Point2D, end: Point2D): Line {
  return {
    id: nextId(),
    type: GraphElementType.Line,
    start,
    end,
  }
}

export function createSquare(start: Point2D, end: Point2D): Square {
  return {
    id: nextId(),
    type: GraphElementType.Square,
    start,
    end,
  }
}

export function createText(position: Point2D, text: string): Text {
  return {
    id: nextId(),
    type: GraphElementType.Text,
    position,
    text,
  }
}

export function copyMoveElement(element: GraphElement, movement: Movement) {
  switch (element.type) {
    case GraphElementType.Line:
    case GraphElementType.Square: {
      const { start, end, ...rest } = element
      return {
        start: copyMovePoint(start, movement),
        end: copyMovePoint(end, movement),
        ...rest,
      }
    }
    case GraphElementType.Text: {
      const { position, ...rest } = element
      return {
        position: copyMovePoint(position, movement),
        ...rest,
      }
    }
  }

  throw new Error('unimplemented copyMoveElement case')
}

export function copyMovePoint(point: Point2D, movement: Movement): Point2D {
  return {
    x: point.x + movement.x,
    y: point.y + movement.y,
  }
}
