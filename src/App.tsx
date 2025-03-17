import { MouseEventHandler, useLayoutEffect, useRef, useState } from 'react'
import { cloneDeep } from 'lodash'
import classNames from 'classnames';
import { getTools, isDrawingTool, Tool } from './Tool';
import { createLine, createSquare, createText, GraphElement } from './GraphElement';
import { Point2D } from './Geometry';
import { Painter } from './Painter'
import './App.css'
import { Graph } from './Graph';
import { Action } from './Action';
import { TextAreaPadding, WritingData, getDefaultWritingData } from './Writing'
import { copyMoveElement } from './Move';

export default function App() {
  const [currentTool, setCurrentTool] = useState(Tool.Text);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graph = useRef(new Graph())

  const action = useRef(Action.None)

  // drawing
  const isDrawing = () => action.current === Action.Drawing
  const startDrawing = () => action.current = Action.Drawing;
  const stopDrawing = () => action.current = Action.None;

  // writing
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
    graph.current.addElement(createText(writing.position, writing.text))
  }
  const stopWriting = () => {
    action.current = Action.None
    setWriting(getDefaultWritingData())
  }

  // moving
  const movingData = useRef<{ element: GraphElement, id: number, start: Point2D }>(null)
  const startMoving = (element: GraphElement, pos: Point2D) => {
    movingData.current = {
      element: cloneDeep(element),
      id: element.id,
      start: pos,
    }
    action.current = Action.Moving;
  }
  const isMoving = () => {
    return action.current === Action.Moving
  }
  const stopMoving = () => {
    movingData.current = null;
    action.current = Action.None;
  }

  const moveToPosition = (pos: Point2D) => {
    if (movingData.current) {
      const { element, id, start } = movingData.current;
      const offset = start.offsetTo(pos)

      const newElement = copyMoveElement(element, offset)
      graph.current.updateElement(id, newElement);
    }
  }

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      throw new Error('canvas not found')
    }

    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('canvas 2d context not found!')
    }

    const setCanvasSize = () => {
      canvas.width = window.devicePixelRatio * canvas.clientWidth;
      canvas.height = window.devicePixelRatio * canvas.clientHeight;
    }
    setCanvasSize();
    context.scale(window.devicePixelRatio, window.devicePixelRatio)

    const painter = new Painter(context);
    context.font = font;
    context.textBaseline = 'top'
    painter.paint(graph.current.elements);

    const unsubscribe = graph.current.addChangeListener(() => {
      painter.paint(graph.current.elements);
    })

    return () => {
      unsubscribe();
    }
  }, [currentTool])

  const handleMouseDown: MouseEventHandler = (e) => {
    const hoveredElement = graph.current.getElementAtPosition(Point2D.of(e.clientX, e.clientY))
    if (hoveredElement) {
      startMoving(hoveredElement, Point2D.of(e.nativeEvent.offsetX, e.nativeEvent.offsetY))
      return
    }

    if (isDrawingTool(currentTool)) {
      startDrawing();
    }

    if (isDrawing()) {
      let newElement
      switch (currentTool) {
        case Tool.Line:
          newElement = createLine(Point2D.of(e.clientX, e.clientY), Point2D.of(e.clientX, e.clientY))
          break;
        case Tool.Square:
          newElement = createSquare(Point2D.of(e.clientX, e.clientY), Point2D.of(e.clientX, e.clientY))
          break;
      }
      graph.current.addElement(newElement!)
    }
  }

  const handleMouseMove: MouseEventHandler = (e) => {
    if (!(isMoving() || currentTool === Tool.Text)) {
      // when moving cursor remains same, calculate only when not moving
      const hoveredElement = graph.current.getElementAtPosition(Point2D.of(e.clientX, e.clientY))
      const cursor = hoveredElement ? 'move' : 'default'
      // console.log('move:  ', cursor)
      e.target.style.cursor = cursor;
    }

    if (isMoving()) {
      moveToPosition(Point2D.of(e.nativeEvent.offsetX, e.nativeEvent.offsetY))
    }

    if (isDrawing()) {
      // TODO: wrap this
      const newElement = {
        ...graph.current.lastElement,
        end: Point2D.of(e.clientX, e.clientY),
      }

      graph.current.updateLastElement(newElement)
    }
  }
  const handleMouseUp: MouseEventHandler = (e) => {
    if (isMoving()) {
      stopMoving();
    }
    if (isDrawing()) {
      stopDrawing();
    }
  }

  const handleClick: MouseEventHandler = (e) => {
    if (currentTool === Tool.Text && !isWriting()) {
      if (hasWritingBlurFlag()) {
        clearWritingBlurFlag();
      } else {
        startWriting({
          // TODO: write current
          text: '',
          position: Point2D.of(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
        });
      }
    }
  }

  const handleBlur = () => {
    if (writing.text) {
      commitWriting();
    }
    stopWriting();
    setWritingBlurFlag();
    // TODO: handleClick 时间异步触发，为什么晚于setTimeout
    // setTimeout(() => {
    //   stopWriting();
    // })
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
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
        style={{ display: 'block', width: '100%', height: '100%' }}
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
            width: 'auto',
            height: 'auto',
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
