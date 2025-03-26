import {
  GraphElement,
  GraphElementType,
  getSvgPathFromStroke,
} from './GraphElement'
import { TextAreaPadding } from './Writing'
import { getStroke } from 'perfect-freehand'

export class Painter {
  constructor(private readonly context: CanvasRenderingContext2D) {}

  paint(elements: GraphElement[]) {
    this.context.clearRect(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height
    )

    elements.forEach((element) => {
      switch (element.type) {
        case GraphElementType.Line:
          this.context.beginPath()
          this.context.moveTo(element.start.x, element.start.y)
          this.context.lineTo(element.end.x, element.end.y)
          this.context.stroke()
          break
        case GraphElementType.Square:
          this.context.strokeRect(
            element.start.x,
            element.start.y,
            element.end.x - element.start.x,
            element.end.y - element.start.y
          )
          break
        case GraphElementType.Text:
          this.context.fillText(
            element.text,
            element.position.x + TextAreaPadding,
            element.position.y + TextAreaPadding
          )
          break
        case GraphElementType.Freehand: {
          {
            const stroke = getStroke(element.points.map((p) => [p.x, p.y, 0]))
            const path = getSvgPathFromStroke(stroke)
            this.context.stroke(new Path2D(path))
            break
          }
        }
      }
    })
  }
}
