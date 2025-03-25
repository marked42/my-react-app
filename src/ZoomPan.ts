import { useCallback, useState } from 'react'
import { Point2D } from './Geometry'

export const MAX_SCALE = 5
export const MIN_SCALE = 0.1
export const SCALE_STEP = 0.1

export function clampScale(value: number) {
  return Math.max(Math.min(MAX_SCALE, value), MIN_SCALE)
}

export function useZoomPan(getCanvas: () => HTMLCanvasElement) {
  // zoom in / out
  const [panOffset, setPanOffset] = useState({
    x: 0,
    y: 0,
  })
  const [scale, setScale] = useState(1)

  /**
   * @{param} pos the scaled position
   */
  const getLogicalCoordinate = useCallback(
    (pos: Point2D) => {
      return Point2D.of(
        pos.x / scale - panOffset.x,
        pos.y / scale - panOffset.y
      )
    },
    [scale, panOffset]
  )

  const getLogicalCoordinateOfEvent = (
    e: React.MouseEvent<Element, MouseEvent>
  ) => {
    const x = e.nativeEvent.offsetX
    const y = e.nativeEvent.offsetY
    return getLogicalCoordinate(Point2D.of(x, y))
  }

  const resetOriginalSize = () => {
    setScale(1)
    setPanOffset({ x: 0, y: 0 })
  }

  const getCanvasCenter = useCallback(() => {
    const canvas = getCanvas()
    return Point2D.of(canvas.clientWidth / 2, canvas.clientHeight / 2)
  }, [getCanvas])

  /**
   * 缩放时要保证缩放中心所在的屏幕位置对应的逻辑像素坐标不变，调整offset，达到中心缩放的效果
   *
   * @param center {Point2D} 默认以画布为中心进行缩放，这里的坐标是画布的事件坐标
   */
  const setScaleAtCenter = useCallback(
    (newScale: number, center: Point2D = getCanvasCenter()) => {
      const clampedScale = clampScale(newScale)
      setScale(clampedScale)

      const { x: logicalX, y: logicalY } = getLogicalCoordinate(center)

      /**
       * 偏移量跟缩放比例有关系，所以比例变化后需要调整偏移量的值
       */
      setPanOffset({
        x: center.x / clampedScale - logicalX,
        y: center.y / clampedScale - logicalY,
      })
    },
    [getCanvasCenter, getLogicalCoordinate]
  )

  const scaleAtCenter = (sign: number, center = getCanvasCenter()) => {
    return setScaleAtCenter(scale + sign * SCALE_STEP, center)
  }
  const scaleDownAtCenter = (center = getCanvasCenter()) => {
    return setScaleAtCenter(scale - SCALE_STEP, center)
  }
  const scaleUpAtCenter = (center = getCanvasCenter()) => {
    return setScaleAtCenter(scale + SCALE_STEP, center)
  }

  /**
   * x, y 是鼠标坐标
   */
  const panByOffset = (x: number, y: number) => {
    setPanOffset((offset) => ({
      x: offset.x + x / scale,
      y: offset.y + y / scale,
    }))
  }

  return {
    scale,
    setScale,

    panOffset,
    setPanOffset,
    panByOffset,

    getLogicalCoordinate,
    getLogicalCoordinateOfEvent,

    resetOriginalSize,

    setScaleAtCenter,
    scaleAtCenter,
    scaleDownAtCenter,
    scaleUpAtCenter,
  }
}
