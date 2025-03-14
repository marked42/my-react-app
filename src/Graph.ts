import { Shape } from './Shape'

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
}
