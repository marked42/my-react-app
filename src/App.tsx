import { MouseEventHandler, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'
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
import { MouseButton } from './MouseButton';
import { usePressedKeys } from './usePressedKeys';

export default function App() {
  const [currentTool, setCurrentTool] = useState(Tool.Line);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const getCanvas = () => {
    if (!canvasRef.current) {
      throw new Error('canvas not found')
    }
    return canvasRef.current
  }
  const contextRef = useRef<CanvasRenderingContext2D>(null);
  const getContext = useCallback(() => {
    const canvas = getCanvas();
    if (!contextRef.current) {
      contextRef.current = canvas.getContext('2d')
    }

    return contextRef.current!
  }, [])

  const setupContext = useCallback(() => {
    const canvas = getCanvas()
    const context = getContext();

    const { devicePixelRatio } = window
    canvas.width = devicePixelRatio * canvas.clientWidth;
    canvas.height = devicePixelRatio * canvas.clientHeight;
    context.scale(devicePixelRatio, devicePixelRatio)
    context.font = CANVAS_FONT;
    context.textBaseline = 'top'
  }, [getContext])

  const graph = useRef(new Graph())

  const painter = useRef<Painter>(null)
  const getPainter = useCallback(() => {
    const context = getContext();
    if (!painter.current) {
      painter.current = new Painter(context);
    }
    return painter.current!
  }, [getContext])

  const paint = useCallback(() => {
    const painter = getPainter()
    painter.paint(graph.current.elements);
  }, [getPainter])

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

  const [panOffset, setPanOffset] = useState({
    x: 0,
    y: 0,
  })
  const getCanvasMousePosition = (e: React.MouseEvent<Element, MouseEvent>) => {
    return Point2D.of(e.nativeEvent.offsetX - panOffset.x, e.nativeEvent.offsetY - panOffset.y)
  }

  const isPanning = () => {
    return action.current === Action.Panning
  }
  const startPanning = () => {
    action.current = Action.Panning;
    setCanvasCursor('grabbing')
  }
  const stopPanning = () => {
    action.current = Action.None;
    setCanvasCursor('default')
  }

  useLayoutEffect(() => {
    // TODO:
    // 1. has to clear translate
    // 2. draw after panning in wrong position
    setupContext();
    const context = getContext()
    context.translate(panOffset.x, panOffset.y);
    paint();
  }, [panOffset, getContext, paint, setupContext])

  useLayoutEffect(() => {
    const canvas = getCanvas();

    setupContext();
    paint();

    const resizeObserver = new ResizeObserver((entries) => {
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
  }, [setupContext, paint])

  const pressedKeys = usePressedKeys()
  const handleMouseDown: MouseEventHandler = (e) => {
    const canvasMousePosition = getCanvasMousePosition(e);
    const isHandTool = currentTool === Tool.Hand;
    if (isHandTool || e.button === MouseButton.Middle || pressedKeys.has(' ')) {
      startPanning();
      return;
    }

    if (currentTool === Tool.Selection) {
      if (hoveredInfo.current) {
        const { element, handle } = hoveredInfo.current
        if (handle === DragHandle.Body) {
          startMoving(element, canvasMousePosition.clone())
        } else {
          startResizing(element, handle, getCanvasMousePosition(e))
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
          newElement = createLine(canvasMousePosition.clone(), canvasMousePosition.clone())
          break;
        case Tool.Square:
          newElement = createSquare(canvasMousePosition.clone(), canvasMousePosition.clone())
          break;
      }
      graph.current.addElement(newElement!)
    }
  }

  useEffect(() => {
    const handleMouseWheel = (e: WheelEvent) => {
      // prevent two-finger touch move on track pad from trigger browser forward / backward
      e.preventDefault();

      setPanOffset(offset => ({
        x: offset.x - Math.ceil(e.deltaX),
        y: offset.y - Math.ceil(e.deltaY),
      }))
    }

    const canvas = getCanvas();

    canvas.addEventListener('wheel', handleMouseWheel);
    return () => {
      canvas.removeEventListener('wheel', handleMouseWheel)
    }
  }, [])

  const setCanvasCursor = (cursor: string) => {
    getCanvas().style.cursor = cursor
  }

  const handleMouseMove: MouseEventHandler = (e) => {
    if (isPanning()) {
      setPanOffset((offset) => ({
        x: offset.x + e.movementX,
        y: offset.y + e.movementY,
      }))
    } else if (isResizing()) {
      resizeElement(getCanvasMousePosition(e));
    } else if (isMoving()) {
      moveToPosition(getCanvasMousePosition(e))
      // 只有选择模式，允许拖动
    } else if (currentTool === Tool.Selection) {
      // when moving cursor remains same, calculate only when not moving
      hoveredInfo.current = graph.current.getElementAtPosition(getCanvasMousePosition(e), getContext())
      setCanvasCursor(getCursorForHandle(hoveredInfo.current?.handle))
    }

    if (isDrawing()) {
      // TODO: wrap this
      const newElement = {
        ...graph.current.lastElement,
        end: getCanvasMousePosition(e),
      }

      graph.current.updateLastElement(newElement)
    }
  }
  const handleMouseUp: MouseEventHandler = (e) => {
    if (isPanning()) {
      stopPanning();
    }
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
          position: getCanvasMousePosition(e),
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

  const download = () => {
    const canvas = getCanvas();
    const url = canvas.toDataURL('image/jpg', 1)

    const link = document.createElement('a')
    link.download = `image-${dayjs().format('YYYY-MM-DD')}.jpg`
    link.href = url;
    link.click();

    link.remove();
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
        top: 10,
        left: 10,
        // TODO: why need zIndex
        zIndex: 1,
      }}>
        <button className="tool-button" onClick={download}>Download</button>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          zIndex: 10,
        }}
      >
        <div>{`panning: (${panOffset.x}, ${panOffset.y})`}</div>
        <button onClick={() => setPanOffset({ x: 0, y: 0 })}>reset</button>
      </div>
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
            left: writing.position.x + panOffset.x,
            top: writing.position.y + panOffset.y,
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
