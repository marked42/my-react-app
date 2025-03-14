import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import { ShapeType } from './Shape';
import { getTools, Tool } from './Tool';
import classNames from 'classnames';
import { Painter } from './Painter'
import './App.css'
import { Graph } from './Graph';


let drawing = false;
const graph = new Graph();


export default function App() {
  const [currentTool, setCurrentTool] = useState(Tool.Line);

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
    painter.paint(graph.shapes);

    const unsubscribe = graph.addChangeListener(() => {
      painter.paint(graph.shapes);
    })

    const handleMouseDown = (e: MouseEvent) => {
      drawing = true;
      let newShape
      switch (currentTool) {
        case Tool.Line:
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
        case Tool.Square:
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
    }
    const handleMouseUp = (e: MouseEvent) => {
      console.log('mouseup', e)
      drawing = false
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    return () => {
      unsubscribe();
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
    }
  }, [currentTool])

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
        {getTools().map(tool => {
          return (
            <button
              key={tool.value}
              className={classNames("tool-button", { 'active': tool.value === currentTool })}
              onClick={() => setCurrentTool(tool.value)}
            >{tool.label}</button>
          )
        })}
      </div>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </Fragment>
  )
}
