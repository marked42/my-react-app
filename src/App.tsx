import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import { Shape, ShapeType } from './Shape';
import { Mode } from './Mode';
import classNames from 'classnames';
import './App.css'


let drawing = false;
export default function App() {
  const [mode, setMode] = useState(Mode.Line);

  const [shapes, setShapes] = useState<Shape[]>([
  ])

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      throw new Error('canvas not found')
    }

    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('canvas 2d context not found!')
    }

    const paintCanvas = () => {
      shapes.forEach(shape => {
        switch (shape.type) {
          case ShapeType.Line:
            context.beginPath();
            context.moveTo(shape.start.x, shape.start.y);
            context.lineTo(shape.end.x, shape.end.y);
            context.stroke();
            break;
          case ShapeType.Square:
            context.strokeRect(shape.start.x, shape.start.y, shape.end.x - shape.start.x, shape.end.y - shape.start.y)
            break
        }
      })
    }
    paintCanvas();

    const handleMouseDown = (e: MouseEvent) => {
      drawing = true;
      let newShape
      switch (mode) {
        case Mode.Line:
          newShape = {
            type: ShapeType.Line,
            start: {
              x: e.clientX,
              y: e.clientY,
            },
            end: {
              x: e.clientX,
              y: e.clientY,
            },
          }
          break;
        case Mode.Square:
          newShape = {
            type: ShapeType.Square,
            start: {
              x: e.clientX,
              y: e.clientY,
            },
            end: {
              x: e.clientX,
              y: e.clientY,
            },
          }
          break;
      }
      setShapes([
        ...shapes,
        newShape!,
      ])
      paintCanvas();
    }
    const handleMouseMove = (e: MouseEvent) => {
      if (!drawing) { return }
      const lastShape = shapes[shapes.length - 1];

      const newShape = {
        ...lastShape,
        end: {
          x: e.clientX,
          y: e.clientY,
        }
      }

      setShapes([
        ...shapes.slice(0, shapes.length - 1),
        newShape,
      ])
    }
    const handleMouseUp = (e: MouseEvent) => {
      console.log('mouseup', e)
      drawing = false
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
    }
  }, [shapes, mode])

  return (
    <Fragment>
      <div style={{
        position: 'absolute',
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
        marginTop: '10px',
        top: 0,
        gap: 10,
      }}>
        <button className={classNames("tool-button", { 'active': mode === Mode.Line })} onClick={() => setMode(Mode.Line)}>line</button>
        <button className={classNames("tool-button", { 'active': mode === Mode.Square })} onClick={() => setMode(Mode.Square)}>square</button>
      </div>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </Fragment>
  )
}
