export const TextAreaPadding = 2

export interface WritingData {
  position: {
    x: number
    y: number
  }
  text: string
}

export const getDefaultWritingData = (): WritingData => {
  return {
    position: {
      x: 0,
      y: 0,
    },
    text: '',
  }
}
