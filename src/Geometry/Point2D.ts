import { Offset } from './Offset'

export class Point2D {
  private constructor(public readonly x: number, public readonly y: number) {}

  static of(x: number, y: number) {
    return new Point2D(x, y)
  }

  // should change to immutable
  static get Origin() {
    return Point2D.of(0, 0)
  }

  distance(other: Point2D) {
    return Point2D.distance(this, other)
  }

  static distance(p1: Point2D, p2: Point2D) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
  }

  offsetTo(point: Point2D) {
    return Offset.of(point.x - this.x, point.y - this.y)
  }

  offsetBy(offset: Offset) {
    return Point2D.of(this.x + offset.x, this.y + offset.y)
  }
}
