import { Point2D } from './Geometry'

export const TextAreaPadding = 2

export interface WritingData {
  position: Point2D
  text: string
}

export const getDefaultWritingData = (): WritingData => {
  return {
    position: Point2D.Origin,
    text: '',
  }
}
