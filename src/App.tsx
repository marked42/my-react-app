import { useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const [show, setShow] = useState(false)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleBlur = () => {
    console.log('blur')
    setTimeout(() => {
      setShow(false)
    })
  }

  const handleMouseDown = (e) => {
    // if (show) {
    //   return;
    // }

    // e.preventDefault();
    // console.log('mousedown')
    // console.log('setshow')
    // setShow(true)
  }
  // FIXME: 使用click的case 会导致再次点击click的时候，首先触发blur，同步 setShow(false)重新渲染，然后触发handleClick
  // 这个时候show已经是false了，所以会再次执行 setShow(true) 从而textarea 没有隐藏

  const handleClick = (e) => {
    if (show) {
      return;
    }
    // e.preventDefault();
    console.log('click')
    setPosition({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    })
    setShow(true)
  }
  const handleFocus = () => {
    console.log('focus')
    // Promise.resolve().then(() => {
    //   console.log('focus next tick')
    // })
  }

  useEffect(() => {
    if (show) {

      textAreaRef.current?.focus()
      // Promise.resolve().then(() => {
      // console.log('call focus next tick')
      // })
    }
  }, [show])

  console.log('render', show)
  return (
    <div
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      style={{
        position: 'relative',
        width: 400,
        height: 400,
        border: '1px solid #ccc'
      }}>
      <textarea
        ref={textAreaRef}
        style={{
          display: show ? 'block' : 'none',
          position: 'absolute',
          left: position.x,
          top: position.y,
        }}
        onBlur={handleBlur}
        onFocus={handleFocus}
      ></textarea>
    </div>
  )
}

export default App
