export enum Tool {
  Hand,
  Selection,
  Line,
  Square,
  Text,
  Freehand,
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
    {
      label: 'freehand',
      value: Tool.Freehand,
    },
  ]
}

// TODO: 这个信息最好在类中，这样新增的类型做到提示实现，否则报错。
const DrawingTools = [Tool.Line, Tool.Square, Tool.Freehand]

export function isDrawingTool(tool: Tool) {
  return DrawingTools.includes(tool)
}
