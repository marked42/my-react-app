export class Offset {
  private constructor(public readonly x: number, public readonly y: number) {}

  static of(x: number, y: number) {
    return new Offset(x, y)
  }
}
