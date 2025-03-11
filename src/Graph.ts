import { Shape } from './Shape'

export class Graph {
  constructor(public shapes: Shape[] = []) {}

  addShape(newShape: Shape) {
    this.setShapes([...this.shapes, newShape])
  }

  updateLastShape(newShape: Shape) {
    this.setShapes([...this.shapes.slice(0, this.shapes.length - 1), newShape])
  }

  setShapes(newShapes: Shape[]) {
    this.shapes = newShapes
  }

  get lastShape() {
    if (this.shapes.length === 0) {
      throw new Error('no last on empty graph')
    }

    return this.shapes[this.shapes.length - 1]
  }
}
