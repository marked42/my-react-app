import { MouseEventHandler, useLayoutEffect, useRef, useState } from 'react'
import { ShapeType } from './Shape';
import { getTools, isDrawingTool, Tool } from './Tool';
import classNames from 'classnames';
import { Painter } from './Painter'
import './App.css'
import { Graph } from './Graph';
import { Action } from './Action';
import { TextAreaPadding } from './Writing'

interface WritingData {
  position: {
    x: number,
    y: number,
  },
  text: string;
}
const getDefaultWritingData = (): WritingData => {
  return {
    position: {
      x: 0,
      y: 0,
    },
    text: '',
  }
}

export default function App() {
  const [currentTool, setCurrentTool] = useState(Tool.Text);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graph = useRef(new Graph())

  const action = useRef(Action.None)

  const isDrawing = () => action.current === Action.Drawing
  const startDrawing = () => action.current = Action.Drawing;
  const stopDrawing = () => action.current = Action.None;

  const [writing, setWriting] = useState(getDefaultWritingData)
  const writingBlurFlag = useRef(false)
  const hasWritingBlurFlag = () => writingBlurFlag.current
  const setWritingBlurFlag = () => writingBlurFlag.current = true
  const clearWritingBlurFlag = () => writingBlurFlag.current = false;

  const font = 'normal 24px sans-serif'
  const isWriting = () => action.current === Action.Writing;
  const startWriting = (writing: WritingData) => {
    action.current = Action.Writing;
    setWriting(writing)
  }
  const commitWriting = () => {
    graph.current.addShape({
      type: ShapeType.Text,
      ...writing,
    })
  }
  const stopWriting = () => {
    action.current = Action.None
    setWriting(getDefaultWritingData())
  }


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
    context.font = font;
    context.textBaseline = 'top'
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

  const handleClick: MouseEventHandler = (e) => {
    if (currentTool === Tool.Text) {
      console.log('click action: ', action.current)
      if (hasWritingBlurFlag()) {
        clearWritingBlurFlag();
      } else {
        startWriting({
          // TODO: write current
          text: '',
          position: {
            x: e.nativeEvent.offsetX,
            y: e.nativeEvent.offsetY
          }
        });
      }
    }
  }

  const handleBlur = () => {
    if (writing.text) {
      console.log('blur')
      commitWriting();
      stopWriting();
      setWritingBlurFlag();
      // TODO: handleClick 时间异步触发，为什么晚于setTimeout
      // setTimeout(() => {
      //   stopWriting();
      // })
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%'
      }}>
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
        onClick={handleClick}
      />
      {isWriting() &&
        <textarea
          autoFocus
          value={writing.text}
          style={{
            position: 'absolute',
            left: writing.position.x,
            top: writing.position.y,
            border: 'none',
            outline: '1px solid blue',
            font,
            padding: TextAreaPadding,
            lineHeight: 1,
            resize: 'none',
            boxSizing: 'border-box'
          }}
          onChange={e => {
            setWriting({
              ...writing,
              text: e.target.value,
            })
          }}
          onBlur={handleBlur}
        ></textarea>
      }
    </div>
  )
}
