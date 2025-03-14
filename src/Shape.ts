export enum ShapeType {
  Line,
  Square,
  Text,
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

interface Text {
  type: ShapeType.Text
  position: Position
  text: string
}

export type Shape = Line | Square | Text
