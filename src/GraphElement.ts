import { Point2D } from './Geometry'
import { getStroke } from 'perfect-freehand'

export enum GraphElementType {
  Line,
  Square,
  Text,
  Freehand,
}

interface BaseGraphElement {
  id: number
}

export interface Line extends BaseGraphElement {
  type: GraphElementType.Line
  start: Point2D
  end: Point2D
}

export interface Square extends BaseGraphElement {
  type: GraphElementType.Square
  start: Point2D
  end: Point2D
}

export interface Text extends BaseGraphElement {
  type: GraphElementType.Text
  position: Point2D
  text: string
}

export interface Freehand extends BaseGraphElement {
  type: GraphElementType.Freehand
  points: Point2D[]
  path: Path2D
}

export type GraphElement = Line | Square | Text | Freehand

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

export function createFreehand(points: Point2D[]): Freehand {
  return {
    id: nextId(),
    type: GraphElementType.Freehand,
    points,
    get path() {
      const stroke = getStroke(this.points.map((p) => [p.x, p.y, 0]))
      const path = getSvgPathFromStroke(stroke)
      return new Path2D(path)
    },
  }
}

const average = (a, b) => (a + b) / 2

export function getSvgPathFromStroke(points, closed = true) {
  const len = points.length

  if (len < 4) {
    return ``
  }

  let a = points[0]
  let b = points[1]
  const c = points[2]

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(
    2
  )},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(
    b[1],
    c[1]
  ).toFixed(2)} T`

  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i]
    b = points[i + 1]
    result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(
      2
    )} `
  }

  if (closed) {
    result += 'Z'
  }

  console.log('path: ', result)
  return result
}
