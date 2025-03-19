# Drawing App

## Painting

- [x] set proper canvas size on high resolution screen
- [x] update canvas width/height when size changes

  1.  https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event
  1.  https://bencentra.com/code/2015/02/27/optimizing-window-resize.html
  1.  https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
  1.  https://web.dev/articles/device-pixel-content-box

- [ ] handle contextlost / contextrestore

## Shapes

- [x] line
- [x] rectangle
- [ ] diamond
- [ ] freehand pencil
- [ ] circle
- [ ] ellipsis
- [ ] arrow
- [ ] image
- [ ] text
  - [ ] use mousedown event for clicking to insert text
  - [ ] support selecting existing text on canvas and keep editing
  - [ ] text editing area size grows automatically by typing instead of fixed size
  - [ ] text font size change automatically to fit textarea when drag to resize

## Eraser

## Resize

use dragging or keyboard

- [ ] line
- [ ] rectangle
- [ ] text

## Move Shapes

use dragging or keyboard

- [x] drag to move text

## Panning

drag or keyboard

## Zoom in / out

- [ ] keyboard cmd + '+'
- [ ] mouse wheel, touch pad, pinch

## Selection Tool

- [ ]. selection tool for line / rectangle, and then drag to adjust line and rectangle
- [ ]. select multiple elements as a group

## Development

### Optimization

1. ADD flag controlling log output for easier DEBUGGING
1. separate logic of different tools and actions, move / resize / drawing

### Caveats

1. setting canvas width or height property clears canvas drawing buffer, aka clears canvas.
1. resize event only fires on window object
1. `e.preventDefault()` not working on event listeners bind by `onMouseDown` attribute because React
   has synthetic event and make `passive: true` by default for better performance, `e.preventDefault()`
   only takes effect when `passive` is `false`.
