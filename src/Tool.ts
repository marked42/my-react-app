export enum Tool {
  Line,
  Square,
}

export function getTools() {
  return [
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
