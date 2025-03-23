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

const { devicePixelRatio } = window
// const devicePixelRatio = 1

const MAX_SCALE = 5
const MIN_SCALE = 0.1

function clampScale(value: number) {
  return Math.max(Math.min(MAX_SCALE, value), MIN_SCALE);
}

export default function App() {
  const [currentTool, setCurrentTool] = useState(Tool.Square);

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

  // zoom in/out, pan
  const [panOffset, setPanOffset] = useState({
    x: 0,
    y: 0,
  })

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

  // zoom in / out
  const [scale, setScale] = useState(1);

  /**
   * @{param} pos the scaled position
   */
  const getLogicalCoordinate = useCallback((pos: Point2D) => {
    return Point2D.of(pos.x / scale - panOffset.x, pos.y / scale - panOffset.y)
  }, [scale, panOffset])

  /**
  * 计算点击的像素位置对应的canvas坐标
  */
  const getLogicalCoordinateOfEvent = (e: React.MouseEvent<Element, MouseEvent>) => {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    return getLogicalCoordinate(Point2D.of(x, y))
  }

  const setupContext = useCallback(() => {
    const canvas = getCanvas()
    const context = getContext();

    canvas.width = devicePixelRatio * canvas.clientWidth;
    canvas.height = devicePixelRatio * canvas.clientHeight;
    // for pixel-perfect painting
    context.scale(devicePixelRatio, devicePixelRatio)

    // for zoom and pan
    /**
     * scale 和 offset对应画布先缩放再偏移的顺序
     * a c e
     * b d f
     * 0 0 1
     */
    context.resetTransform();
    context.scale(scale * devicePixelRatio, scale * devicePixelRatio)
    context.translate(panOffset.x, panOffset.y);
    // context.setTransform(scale * devicePixelRatio, 0, 0, scale * devicePixelRatio, panOffset.x, panOffset.y)

    context.font = CANVAS_FONT;
    context.textBaseline = 'top'
  }, [getContext, scale, panOffset])

  useLayoutEffect(() => {
    graph.current.addElement(createSquare(Point2D.of(100, 100), Point2D.of(200, 200)));
    setupContext();
    paint();
  }, [paint, setupContext])

  useLayoutEffect(() => {
    const canvas = getCanvas();

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
    const canvasMousePosition = getLogicalCoordinateOfEvent(e);
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
          startResizing(element, handle, getLogicalCoordinateOfEvent(e))
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

  const getCanvasCenter = useCallback(() => {
    const canvas = getCanvas();
    return Point2D.of(canvas.clientWidth / 2, canvas.clientHeight / 2);
  }, [])

  const resetOriginalSize = () => {
    setScale(1)
    setPanOffset({ x: 0, y: 0 })
  }
  /**
   * 缩放时要保证缩放中心所在的屏幕位置对应的逻辑像素坐标不变，调整offset，达到中心缩放的效果
   *
   * @param center {Point2D} 默认以画布为中心进行缩放
   */
  const setScaleAtCenter = useCallback((newScale: number, center: Point2D = getCanvasCenter()) => {
    const clampedScale = clampScale(newScale);
    setScale(clampedScale)

    const { x: logicalX, y: logicalY } = getLogicalCoordinate(center)

    /**
     * 偏移量跟缩放比例有关系，所以比例变化后需要调整偏移量的值
     */
    setPanOffset({
      x: center.x / clampedScale - logicalX,
      y: center.y / clampedScale - logicalY,
    })
  }, [getCanvasCenter, getLogicalCoordinate])
  const scaleDownAtCenter = (delta: number) => {
    return setScaleAtCenter(scale - delta)
  }
  const scaleUpAtCenter = (delta: number) => {
    return setScaleAtCenter(scale + delta)
  }

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // prevent two-finger touch move on track pad from trigger browser forward / backward
      e.preventDefault();

      if (pressedKeys.has("Meta") || pressedKeys.has("Control")) {
        // 归一化
        const unit = e.deltaY < 0 ? 1 : -1

        const SCALE_STEP = .1;
        const newScale = scale + unit * SCALE_STEP;
        // 以鼠标位置为中心缩放
        // const ScaledCenter = Point2D.of(e.offsetX, e.offsetY)
        // setScaleAtCenter(newScale, ScaledCenter)
        setScaleAtCenter(newScale)
      } else {
        // triggered by touch pad
        setPanOffset(offset => ({
          x: offset.x - Math.ceil(e.deltaX) / scale,
          y: offset.y - Math.ceil(e.deltaY) / scale,
        }))
      }
    }

    const canvas = getCanvas();

    canvas.addEventListener('wheel', handleWheel);
    return () => {
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [scale, pressedKeys, panOffset, setScaleAtCenter])

  const setCanvasCursor = (cursor: string) => {
    getCanvas().style.cursor = cursor
  }

  const handleMouseMove: MouseEventHandler = (e) => {
    if (isPanning()) {
      setPanOffset((offset) => ({
        x: offset.x + e.movementX / scale,
        y: offset.y + e.movementY / scale,
      }))
    } else if (isResizing()) {
      resizeElement(getLogicalCoordinateOfEvent(e));
    } else if (isMoving()) {
      moveToPosition(getLogicalCoordinateOfEvent(e))
      // 只有选择模式，允许拖动
    } else if (currentTool === Tool.Selection) {
      // when moving cursor remains same, calculate only when not moving
      hoveredInfo.current = graph.current.getElementAtPosition(getLogicalCoordinateOfEvent(e), getContext())
      setCanvasCursor(getCursorForHandle(hoveredInfo.current?.handle))
    }

    if (isDrawing()) {
      // TODO: wrap this
      const newElement = {
        ...graph.current.lastElement,
        end: getLogicalCoordinateOfEvent(e),
      }

      graph.current.updateLastElement(newElement)
    }
  }
  const handleMouseUp: MouseEventHandler = () => {
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
          position: getLogicalCoordinateOfEvent(e),
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
        <div>
          <button onClick={() => scaleDownAtCenter(0.1)}>-</button>
          <input type="number" value={scale} onChange={e => setScaleAtCenter(Number(e.target.value))}></input>
          <button onClick={() => scaleUpAtCenter(0.1)}>+</button>
        </div>
        <button onClick={resetOriginalSize}>reset</button>
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
        style={{ display: 'block', width: 600, height: 600, border: '1px solid black' }}
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
