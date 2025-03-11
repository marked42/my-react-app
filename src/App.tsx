import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import { ShapeType } from './Shape';
import { Mode } from './Mode';
import classNames from 'classnames';
import { Painter } from './Painter'
import './App.css'
import { Graph } from './Graph';


let drawing = false;
const graph = new Graph();

export default function App() {
  const [mode, setMode] = useState(Mode.Line);

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

    const painter = new Painter(context);
    // initial paint
    painter.paint(graph.shapes);

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
      graph.addShape(newShape!)
      painter.paint(graph.shapes);
    }
    const handleMouseMove = (e: MouseEvent) => {
      if (!drawing) { return }

      const newShape = {
        ...graph.lastShape,
        end: {
          x: e.clientX,
          y: e.clientY,
        }
      }

      graph.updateLastShape(newShape)
      painter.paint(graph.shapes);
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
  }, [mode])

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
