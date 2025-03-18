import { DragHandle } from './DragHandle'
import { Offset } from './Geometry'
import { GraphElement, GraphElementType } from './GraphElement'

export function copyResizeElement(
  element: GraphElement,
  handle: DragHandle,
  offset: Offset
) {
  switch (element.type) {
    case GraphElementType.Line: {
      const newElement = { ...element }
      newElement[handle] = element[handle].offsetBy(offset)
      return newElement
    }
    case GraphElementType.Square: {
      throw new Error('unimplemented')
    }
    case GraphElementType.Text: {
      throw new Error('unimplemented')
    }
  }

  throw new Error('unimplemented copyMoveElement case')
}
