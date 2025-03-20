import { useEffect, useState } from 'react'

export function usePressedKeys() {
  const [pressedKeys, setPressedKeys] = useState(new Set())

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      setPressedKeys((keys) => {
        const newSet = new Set(keys)
        newSet.add(e.key)

        return newSet
      })
    }

    const handleKeyup = (e: KeyboardEvent) => {
      setPressedKeys((keys) => {
        const newSet = new Set(keys)
        newSet.delete(e.key)

        return newSet
      })
    }

    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('keyup', handleKeyup)
    return () => {
      window.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('keyup', handleKeyup)
    }
  }, [])

  return pressedKeys
}
