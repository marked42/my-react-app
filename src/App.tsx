import { useCallback, useLayoutEffect, useRef, useState } from 'react'
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

  useLayoutEffect(() => {
    const canvas = getCanvas();
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    contextRef.current = canvas.getContext('2d');
    const context = getContext();
  })

  useLayoutEffect(() => {
    paint();
  }, [paint])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: 600,
        height: 600,
        border: '1px solid black',
      }}></canvas>
  )
}

export default App
