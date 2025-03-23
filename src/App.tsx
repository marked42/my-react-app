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
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useLayoutEffect(() => {
    const canvas = getCanvas();
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    contextRef.current = canvas.getContext('2d');
    const context = getContext();
    context.scale(scale, scale)
    context.translate(offset.x, offset.y);

    paint();
  }, [scale, offset, paint])

  const handleWheel: React.WheelEventHandler<HTMLCanvasElement> = (e) => {
    const step = 0.1;
    const unit = e.deltaY < 0 ? 1 : -1
    console.log('unit: ', unit, e.deltaY)

    // const gx = (e.nativeEvent.offsetX - offset.x) / scale
    // const gy = (e.nativeEvent.offsetY - offset.y) / scale

    // offset.x =
    // offset.y = gy * newScale - e.nativeEvent.offsetY;
    setScale((scale) => {
      const newScale = scale + unit * step;

      return Math.max(Math.min(5, newScale), 0.1);
    })
    // setOffset({
    //   x: gx * newScale - e.nativeEvent.offsetX,
    //   y: gy * newScale - e.nativeEvent.offsetY,
    // })
  }

  useLayoutEffect(() => {
    paint();
  }, [paint])

  return (
    <Fragment>
      <div style={{ position: 'fixed', top: 10, right: 10 }}>
        <div> {scale.toFixed(2)} </div>
        <div> {`(${offset.x}, ${offset.y})`} </div>
      </div>
      <canvas
        ref={canvasRef}
        style={{
          width: 600,
          height: 600,
          border: '1px solid black',
        }}
        onWheel={handleWheel}
      ></canvas>
    </Fragment>
  )
}

export default App
