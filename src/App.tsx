import { Fragment, useCallback, useLayoutEffect, useRef, useState } from 'react'
import './App.css'

type Element = {
  type: 'square',
  x: number,
  y: number,
  width: number,
  height: number,
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const getCanvas = () => {
    if (!canvasRef.current) {
      throw new Error('canvas not found')
    }
    return canvasRef.current
  }

  const contextRef = useRef<CanvasRenderingContext2D>(null);
  const getContext = () => {
    if (!contextRef.current) {
      throw new Error('context not found')
    }

    return contextRef.current!
  }

  const [elements, setElements] = useState<Element[]>(() => {
    const elements = [
      {
        type: "square",
        x: 100,
        y: 100,
        width: 100,
        height: 100,
      }
    ]
    return elements as Element[];
  })

  const paint = useCallback(() => {
    const context = getContext();
    elements.forEach(element => {
      if (element.type === 'square') {
        context.fillRect(element.x, element.y, element.width, element.height)
      }
    })
  }, [elements])

  const [scale, setScale] = useState(1);
  /**
   * offset 代表经过放大缩小和偏移后，画布远点距离canvas左上角的位置偏移
   */
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useLayoutEffect(() => {
    const canvas = getCanvas();
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    contextRef.current = canvas.getContext('2d');
    const context = getContext();
    /**
     * scale 和 offset对应画布先缩放再偏移的顺序
     */
    // context.scale(scale, scale)
    // context.translate(offset.x, offset.y);
    /**
     * a c e
     * b d f
     * 0 0 1
     */
    context.setTransform(scale, 0, 0, scale, offset.x, offset.y)

    paint();
  }, [scale, offset, paint])

  useLayoutEffect(() => {
    paint();
  }, [paint])

  /**
   * 计算点击的像素位置对应的canvas坐标
   */
  const getCanvasPosition = (x: number, y: number) => {
    return {
      x: (x - offset.x) / scale,
      y: (y - offset.y) / scale,
    }
  }

  const [scaleCenter, setScaleCenter] = useState('center');

  const handleWheel: React.WheelEventHandler<HTMLCanvasElement> = (e) => {
    e.preventDefault();

    // 归一化
    const unit = e.deltaY < 0 ? 1 : -1

    // 以画布中心为中心线进行缩放
    const CanvasCenter = { x: 300, y: 300 }
    // 默认以原点为中心进行缩放，以任意位置为中心缩放
    const ScaledCenter = scaleCenter === 'center' ? CanvasCenter : { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, }
    const SCALE_STEP = .1;
    const MAX_SCALE = 5
    const MIN_SCALE = 0.1

    const newScale = Math.max(Math.min(MAX_SCALE, scale + unit * SCALE_STEP), MIN_SCALE);
    setScale(newScale)

    /**
     * 偏移量跟缩放比例有关系，所以比例变化后需要调整偏移量的值
     */
    setOffset({
      x: ScaledCenter.x - (ScaledCenter.x - offset.x) / scale * newScale,
      y: ScaledCenter.y - (ScaledCenter.y - offset.y) / scale * newScale,
    })
  }

  const panning = useRef(false);
  const handleMouseDown: React.MouseEventHandler = (e) => {
    if (e.button === 1) {
      panning.current = true
    }
  }

  const handleMouseMove: React.MouseEventHandler = (e) => {
    if (panning.current) {
      // const position = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }
      setOffset(offset => ({
        x: offset.x + e.movementX,
        y: offset.y + e.movementY,
      }))
    }
  }

  const handleMouseUp = () => {
    panning.current = false
  }

  return (
    <Fragment>
      <div style={{ position: 'fixed', top: 10, left: 10, right: 10, display: 'flex', gap: 10, justifyContent: 'center', }}>
        <select onChange={e => setScaleCenter(e.target.value)}>
          <option value={'center'}>center</option>
          <option value={'cursor'}>cursor</option>
        </select>
        <div> {scale.toFixed(2)} </div>
        <div> {`(${offset.x.toFixed(2)}, ${offset.y.toFixed(2)})`} </div>
      </div>
      <canvas
        ref={canvasRef}
        style={{
          width: 600,
          height: 600,
          border: '1px solid black',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      ></canvas>
    </Fragment>
  )
}

export default App
