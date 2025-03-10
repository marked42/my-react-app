export enum ShapeType {
  Line,
  Square,
}

interface Position {
  x: number
  y: number
}

interface Line {
  type: ShapeType.Line
  start: Position
  end: Position
}

interface Square {
  type: ShapeType.Square
  start: Position
  end: Position
}

export type Shape = Line | Square
