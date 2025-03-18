import { GraphElement, GraphElementType, Line } from './GraphElement'
import {
  isNearPoint,
  isPointOnText,
  isPositionOnLine,
  isPositionOnSquare,
  Point2D,
} from './Geometry'
import { DragHandle } from './DragHandle'

interface ChangeListener {
  (): void
}

export class Graph {
  private listeners: ChangeListener[] = []
  public context?: CanvasRenderingContext2D

  constructor(public elements: GraphElement[] = []) {}

  addElement(newElement: GraphElement) {
    this.setElements([...this.elements, newElement])
  }

  updateLastElement(newElement: GraphElement) {
    this.setElements([
      ...this.elements.slice(0, this.elements.length - 1),
      newElement,
    ])
  }

  setElements(newElements: GraphElement[]) {
    this.elements = newElements

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

  get lastElement() {
    if (this.elements.length === 0) {
      throw new Error('no last on empty graph')
    }

    return this.elements[this.elements.length - 1]
  }

  findElement(id: number) {
    return this.elements.find((element) => element.id === id)
  }

  updateElement(id: number, newElement: GraphElement) {
    const element = this.findElement(id)
    if (element) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...rest } = newElement
      Object.keys(rest).forEach((key) => {
        // @ts-expect-error TODO:
        element[key] = newElement[key]
      })
    }

    this.triggerChangeListeners()
  }

  getElementAtPosition(position: Point2D) {
    for (const element of this.elements) {
      switch (element.type) {
        case GraphElementType.Line:
          {
            const hovered = this.getHoveredLine(position, element)
            if (hovered) {
              return hovered
            }
          }
          break
        case GraphElementType.Square:
          if (isPositionOnSquare(position, element.start, element.end)) {
            return {
              element,
              handle: DragHandle.Body,
            }
          }
          break
        case GraphElementType.Text:
          if (isPointOnText(position, element, this?.context)) {
            return {
              element,
              handle: DragHandle.Body,
            }
          }
          break
      }
    }

    return null
  }

  getHoveredInfo(position: Point2D, element: GraphElement) {
    switch (element.type) {
      case GraphElementType.Line:
        return this.getHoveredLine(position, element)
      case GraphElementType.Square:
        throw new Error('not implemented')
      case GraphElementType.Text:
        throw new Error('not implemented')
    }
  }

  getHoveredLine(position: Point2D, element: Line) {
    const onLine = isPositionOnLine(position, element.start, element.end, 2)
    if (!onLine) {
      return
    }

    if (isNearPoint(position, element.start)) {
      return {
        element,
        handle: DragHandle.Start,
      }
    }

    if (isNearPoint(position, element.end)) {
      return {
        element,
        handle: DragHandle.End,
      }
    }

    return {
      element,
      handle: DragHandle.Body,
    }
  }
}
