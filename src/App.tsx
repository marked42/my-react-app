import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import { Shape, ShapeType } from './Shape';
import { Mode } from './Mode';
import classNames from 'classnames';
import './App.css'


export default function App() {
  const [mode, setMode] = useState(Mode.Line);

  const [shapes, setShapes] = useState<Shape[]>([
    {
      type: ShapeType.Line,
      start: {
        x: 100,
        y: 100,
      },
      end: {
        x: 200,
        y: 200,
      }
    }
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

    shapes.forEach(shape => {
      switch (shape.type) {
        case ShapeType.Line:
          context.beginPath();
          context.moveTo(shape.start.x, shape.start.y);
          context.lineTo(shape.end.x, shape.end.y);
          context.stroke();
          break;
        case ShapeType.Square:
          context.strokeRect(shape.start.x, shape.start.y, shape.end.x, shape.end.y)
          break
      }
    })
  }, [shapes])

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
