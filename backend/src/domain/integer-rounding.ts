export function divideBy100RoundingHalfUp(value: number): number {
  return Math.floor((value + 50) / 100);
}
