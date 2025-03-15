import { Point2D } from './Geometry'

export const TextAreaPadding = 2

export interface WritingData {
  position: Point2D
  text: string
}

export const getDefaultWritingData = (): WritingData => {
  return {
    // TODO: refactor to Point2D.Origin
    position: {
      x: 0,
      y: 0,
    },
    text: '',
  }
}
