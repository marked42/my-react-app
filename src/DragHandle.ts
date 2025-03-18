export enum DragHandle {
  Start = 'start',
  End = 'end',
  Body = 'body',
}

export function getCursorForHandle(handle?: DragHandle) {
  if (!handle) {
    return 'default'
  }

  const cursors = {
    [DragHandle.Start]: 'nw-resize',
    [DragHandle.End]: 'nw-resize',
    [DragHandle.Body]: 'move',
  }

  return cursors[handle] || 'default'
}
