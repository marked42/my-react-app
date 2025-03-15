import { Shape, ShapeType } from './Shape'
import { TextAreaPadding } from './Writing'

export class Painter {
  constructor(private readonly context: CanvasRenderingContext2D) {}

  paint(shapes: Shape[]) {
    this.context.clearRect(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height
    )

    shapes.forEach((shape) => {
      switch (shape.type) {
        case ShapeType.Line:
          this.context.beginPath()
          this.context.moveTo(shape.start.x, shape.start.y)
          this.context.lineTo(shape.end.x, shape.end.y)
          this.context.stroke()
          break
        case ShapeType.Square:
          this.context.strokeRect(
            shape.start.x,
            shape.start.y,
            shape.end.x - shape.start.x,
            shape.end.y - shape.start.y
          )
          break
        case ShapeType.Text:
          this.context.fillText(
            shape.text,
            shape.position.x + TextAreaPadding,
            shape.position.y + TextAreaPadding
          )
          break
      }
    })
  }
}
