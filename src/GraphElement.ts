import { Offset, Point2D } from './Geometry'

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

export function copyMoveElement(element: GraphElement, offset: Offset) {
  switch (element.type) {
    case GraphElementType.Line:
    case GraphElementType.Square: {
      const { start, end, ...rest } = element
      return {
        start: start.offsetBy(offset),
        end: end.offsetBy(offset),
        ...rest,
      }
    }
    case GraphElementType.Text: {
      const { position, ...rest } = element
      return {
        position: position.offsetBy(offset),
        ...rest,
      }
    }
  }

  throw new Error('unimplemented copyMoveElement case')
}
