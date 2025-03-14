export enum Tool {
  Selection,
  Line,
  Square,
}

export function getTools() {
  return [
    {
      label: 'selection',
      value: Tool.Selection,
    },
    {
      label: 'line',
      value: Tool.Line,
    },
    {
      label: 'square',
      value: Tool.Square,
    },
  ]
}

const DrawingTools = [Tool.Line, Tool.Square]

export function isDrawingTool(tool: Tool) {
  return DrawingTools.includes(tool)
}
