import { useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const [show, setShow] = useState(false)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const handleBlur = () => {
    console.log('blur')
    setShow(false)
  }

  const handleMouseDown = (e) => {
    console.log('mousedown')
    if (show) {
      return;
    }

    // FIXME: 使用 mousedown 事件，点击首先触发mousedown时间，setShow(true)重新渲染，使得textarea显式出来，并获得焦点
    // 但是mousedown事件的默认行为随后会导致textarea失去焦点，触发blur事件，handleBlur调用setShow(false)
    // 重新渲染，隐藏textarea，所以表现为textarea没有显示出来。
    // 使用 e.preventDefault() 避免textarea失去焦点
    // e.preventDefault()
    console.log('setshow')
    setShow(true)
  }
  const handleClick = () => {
    console.log('click')
  }
  const handleFocus = () => {
    console.log('focus')
  }

  useEffect(() => {
    if (show) {

      textAreaRef.current?.focus()
    }
  }, [show])

  console.log('render', show)
  return (
    <div
      onClick={handleClick}
      onMouseDown={handleMouseDown} style={{
        width: 400,
        height: 400,
        border: '1px solid #ccc'
      }}>
      <textarea
        ref={textAreaRef}
        style={{
          display: show ? 'block' : 'none',
        }}
        onBlur={handleBlur}
        onFocus={handleFocus}
      ></textarea>
    </div>
  )
}

export default App
