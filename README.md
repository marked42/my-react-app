# Drawing App

TODOS:

- [x] set proper canvas size on high resolution screen
- [ ] update canvas width/height when size changes
  1.  https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event
  1.  https://bencentra.com/code/2015/02/27/optimizing-window-resize.html
  1.  https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver

1. selection tool for line / rectangle, and then drag to adjust line and rectangle
1. text

   - [x] drag to move text
   - [ ] support selecting existing text on canvas and keep editing
   - [ ] text editing area size grows automatically by typing instead of fixed size
   - [ ] text font size change automatically to fit textarea when drag to resize

1. ADD flag controlling log output for easier DEBUGGING
1. separate logic of different tools and actions, move / resize / drawing

caveats

1. setting canvas width or height property clears canvas drawing buffer, aka clears canvas.
1. resize event only fires on window object
