import { Fragment, MouseEventHandler, useLayoutEffect, useRef, useState } from 'react'
import { ShapeType } from './Shape';
import { getTools, isDrawingTool, Tool } from './Tool';
import classNames from 'classnames';
import { Painter } from './Painter'
import './App.css'
import { Graph } from './Graph';
import { Action } from './Action';

export default function App() {
  const [currentTool, setCurrentTool] = useState(Tool.Selection);
  const action = useRef(Action.None)
  const graph = useRef(new Graph())
  const isDrawing = () => action.current === Action.Drawing
  const startDrawing = () => action.current = Action.Drawing;
  const stopDrawing = () => action.current = Action.None;

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
    painter.paint(graph.current.shapes);

    const unsubscribe = graph.current.addChangeListener(() => {
      painter.paint(graph.current.shapes);
    })

    return () => {
      unsubscribe();
    }
  }, [currentTool])

  const handleMouseDown: MouseEventHandler = (e) => {
    if (isDrawingTool(currentTool)) {
      startDrawing();
    }

    if (isDrawing()) {
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
      graph.current.addShape(newShape!)
    }
  }

  const handleMouseMove: MouseEventHandler = (e) => {
    if (isDrawing()) {
      const newShape = {
        ...graph.current.lastShape,
        end: {
          x: e.clientX,
          y: e.clientY,
        }
      }

      graph.current.updateLastShape(newShape)
    }
  }
  const handleMouseUp: MouseEventHandler = (e) => {
    if (isDrawing()) {
      stopDrawing();
    }
  }

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
      <canvas
        ref={canvasRef}
        style={{ display: 'block' }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      />
    </Fragment>
  )
}
