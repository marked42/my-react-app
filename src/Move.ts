import { Offset } from './Geometry'
import { GraphElement, GraphElementType } from './GraphElement'

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
    case GraphElementType.Freehand: {
      const { points, ...rest } = element
      return {
        points: points.map((point) => point.offsetBy(offset)),
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
