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
import { CANVAS_FONT } from './const';
import { DragHandle, getCursorForHandle } from './DragHandle';
import { copyResizeElement } from './Resize';

export default function App() {
  const [currentTool, setCurrentTool] = useState(Tool.Line);
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
  const fontStyle = {
    fontFamily: 'sans-serif',
    fontSize: 100,
  }

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

  const hoveredInfo = useRef<{ element: GraphElement, handle: DragHandle }>(null);

  // moving
  const movingData = useRef<{ element: GraphElement, id: number, start: Point2D }>(null)
  const startMoving = (element: GraphElement, pos: Point2D) => {
    movingData.current = {
      // should use copy of element to prevent being changed during consecutive resizing update
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

  // resize
  const resizingData = useRef<{ element: GraphElement, handle: DragHandle, start: Point2D }>(null)
  const isResizing = () => action.current === Action.Resizing;
  const startResizing = (element: GraphElement, handle: DragHandle, pos: Point2D) => {
    action.current = Action.Resizing;
    resizingData.current = {
      // should use copy of element to prevent being changed during consecutive resizing update
      element: cloneDeep(element),
      handle,
      start: pos,
    }
  }
  const stopResizing = () => {
    action.current = Action.None;
    resizingData.current = null
  }
  const resizeElement = (pos: Point2D) => {
    if (resizingData.current) {
      const { element, handle, start } = resizingData.current;
      const offset = start.offsetTo(pos)

      const newElement = copyResizeElement(element, handle, offset)

      graph.current.updateElement(element.id, newElement);
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
    graph.current.context = context;

    const setupContext = () => {
      const { devicePixelRatio } = window
      canvas.width = devicePixelRatio * canvas.clientWidth;
      canvas.height = devicePixelRatio * canvas.clientHeight;
      context.scale(devicePixelRatio, devicePixelRatio)
      context.font = CANVAS_FONT;
      context.textBaseline = 'top'
    }
    setupContext();

    const painter = new Painter(context);

    const paint = () => {
      painter.paint(graph.current.elements);
    }

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === canvas) {
          setupContext();
          paint()
        }
      }
    })

    const unsubscribe = graph.current.addChangeListener(() => {
      paint();
    })
    resizeObserver.observe(canvas)

    return () => {
      unsubscribe();
      resizeObserver.unobserve(canvas)
      resizeObserver.disconnect();
    }
  }, [])

  const handleMouseDown: MouseEventHandler = (e) => {
    if (currentTool === Tool.Selection) {
      if (hoveredInfo.current) {
        const { element, handle } = hoveredInfo.current
        if (handle === DragHandle.Body) {
          startMoving(element, Point2D.of(e.nativeEvent.offsetX, e.nativeEvent.offsetY))
        } else {
          startResizing(element, handle, Point2D.of(e.nativeEvent.offsetX, e.nativeEvent.offsetY))
        }
        return
      }
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
    if (isResizing()) {
      resizeElement(Point2D.of(e.nativeEvent.offsetX, e.nativeEvent.offsetY));
    } else if (isMoving()) {
      moveToPosition(Point2D.of(e.nativeEvent.offsetX, e.nativeEvent.offsetY))
      // 只有选择模式，允许拖动
    } else if (currentTool === Tool.Selection) {
      // when moving cursor remains same, calculate only when not moving
      hoveredInfo.current = graph.current.getElementAtPosition(Point2D.of(e.clientX, e.clientY))
      // console.log('move:  ', cursor)
      e.target.style.cursor = getCursorForHandle(hoveredInfo.current?.handle);
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
    if (isResizing()) {
      stopResizing();
    }
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
            font: CANVAS_FONT,
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
