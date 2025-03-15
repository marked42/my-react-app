import {
  isPositionOnLine,
  isPositionOnSquare,
  Point2D,
  Shape,
  ShapeType,
} from './Shape'

interface ChangeListener {
  (): void
}

export class Graph {
  private listeners: ChangeListener[] = []

  constructor(public shapes: Shape[] = []) {}

  addShape(newShape: Shape) {
    this.setShapes([...this.shapes, newShape])
  }

  updateLastShape(newShape: Shape) {
    this.setShapes([...this.shapes.slice(0, this.shapes.length - 1), newShape])
  }

  setShapes(newShapes: Shape[]) {
    this.shapes = newShapes

    this.triggerChangeListeners()
  }

  private triggerChangeListeners() {
    this.listeners.forEach((listener) => {
      listener()
    })
  }

  private removeListener(listener: ChangeListener) {
    this.listeners = this.listeners.filter((val) => val !== listener)
  }

  addChangeListener(listener: ChangeListener) {
    this.listeners.push(listener)

    return () => {
      this.removeListener(listener)
    }
  }

  get lastShape() {
    if (this.shapes.length === 0) {
      throw new Error('no last on empty graph')
    }

    return this.shapes[this.shapes.length - 1]
  }

  findShape(id: number) {
    return this.shapes.find((shape) => shape.id === id)
  }

  updateShape(id: number, newShape: Shape) {
    const shape = this.findShape(id)
    if (shape) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = newShape
      Object.keys(rest).forEach((key) => {
        // @ts-expect-error TODO:
        shape[key] = newShape[key]
      })
    }

    this.triggerChangeListeners()
  }

  getShapeAtPosition(position: Point2D) {
    for (const shape of this.shapes) {
      switch (shape.type) {
        case ShapeType.Line:
          if (isPositionOnLine(shape, position)) {
            return shape
          }
          break
        case ShapeType.Square:
          if (isPositionOnSquare(position, shape.start, shape.end)) {
            return shape
          }
          break
        case ShapeType.Text:
          break
      }
    }

    return null
  }
}
