export class CanvasEvent {
  private readonly events: Record<string, () => void> = {}

  constructor(private readonly canvas: HTMLCanvasElement) {}

  setupEvents() {}

  dispose() {}
}
