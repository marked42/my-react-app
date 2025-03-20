export enum Tool {
  Hand,
  Selection,
  Line,
  Square,
  Text,
}

export function getTools() {
  return [
    {
      label: 'hand',
      value: Tool.Hand,
    },
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
    {
      label: 'text',
      value: Tool.Text,
    },
  ]
}

const DrawingTools = [Tool.Line, Tool.Square]

export function isDrawingTool(tool: Tool) {
  return DrawingTools.includes(tool)
}
