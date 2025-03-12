import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import { Shape, ShapeType } from './Shape';
import { Mode } from './Mode';
import classNames from 'classnames';
import { Painter } from './Painter'
import './App.css'
import { Graph } from './Graph';


let drawing = false;
const graph = new Graph();
window.graph = graph;


export default function App() {
  const [mode, setMode] = useState(Mode.Line);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [writing, setWriting] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });


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



    // canvas.addEventListener('mousedown', handleMouseDown)
    // canvas.addEventListener('mousemove', handleMouseMove)
    // canvas.addEventListener('mouseup', handleMouseUp)
    // canvas.addEventListener('click', handleClick)
    return () => {
      unsubscribe();
      // canvas.removeEventListener('mousedown', handleMouseDown)
      // canvas.removeEventListener('mousemove', handleMouseMove)
      // canvas.removeEventListener('mouseup', handleMouseUp)
      // canvas.removeEventListener('click', handleClick)
    }
  }, [mode, writing])

  const handleMouseDown: React.MouseEventHandler = (e) => {
    // in writing mode
    if (writing) {
      return;
    }

    drawing = true;
    let newShape: Shape;
    switch (mode) {
      case Mode.Line:
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
      case Mode.Square:
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
      case Mode.Text:
        // ignore for now
        break;
      default:
        throw new Error('not implemented')
    }
    if (newShape) {
      graph.addShape(newShape)
    }
  }
  const handleMouseMove: React.MouseEventHandler = (e) => {
    // in writing mode
    if (writing) { return; }
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
  const handleMouseUp: React.MouseEventHandler = (e) => {
    // in writing mode
    if (writing) { return; }
    console.log('mouseup', e)
    drawing = false
  }

  const handleClick: React.MouseEventHandler = (e) => {
    if (mode === Mode.Text) {
      console.log('click: ', writing)
      if (!writing) {
        setPosition({
          x: e.clientX,
          y: e.clientY,
        })
        setWriting(true)
      }
    }
  }

  const showTextArea = mode === Mode.Text && writing
  const handleBlur = (e) => {
    console.log('blur: ', blur)
    setWriting(false)
    graph.addShape({
      type: ShapeType.Text,
      start: { ...position },
      text: e.target.value
    })
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
        <button className={classNames("tool-button", { 'active': mode === Mode.Line })} onClick={() => setMode(Mode.Line)}>line</button>
        <button className={classNames("tool-button", { 'active': mode === Mode.Square })} onClick={() => setMode(Mode.Square)}>square</button>
        <button className={classNames("tool-button", { 'active': mode === Mode.Text })} onClick={() => setMode(Mode.Text)}>text</button>
      </div>
      <canvas
        ref={canvasRef}
        style={{ display: 'block' }}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      />
      <textarea
        onBlur={handleBlur}
        style={{
          display: showTextArea ? 'block' : 'none',
          position: 'absolute',
          border: '1px solid black',
          outline: 'none',
          left: position.x,
          top: position.y,
          width: 100,
          height: 100,
        }} />
    </Fragment>
  )
}
