/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export function insertAtIndex(
  array: any[],
  index: number,
  item: any,
  insertExactlyAtIndex?: boolean
): any[] {
  const copy = array.slice();
  copy.splice(index, insertExactlyAtIndex ? 1 : 0, item);
  return copy;
}

export function removeAtIndex(array: any[], index: number): any[] {
  const copy = array.slice();
  copy.splice(index, 1);
  return copy;
}

export function getRandomNumber(upperBound: number, lowerBound = 0): number {
  const randomNumber = Math.floor(Math.random() * upperBound);
  return Math.max(randomNumber, lowerBound);
}

export function getRandomIndex(array: any[]): number {
  return getRandomNumber(array.length);
}
/* eslint-enable @typescript-eslint/no-explicit-any */
/* eslint-enable @typescript-eslint/explicit-module-boundary-types */
