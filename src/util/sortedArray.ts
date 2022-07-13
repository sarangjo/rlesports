// type Equator<T> = (a: T, b: T) => boolean;
export type Comparator<T> = (a: T, b: T) => number;

// function simpleCompare<T>(a: T, b: T) {
//   // unbox objects, but do not confuse object literals
//   // mercifully handles the Date case
//   if (a === b) return 0;
//   var aType = typeof a;
//   var bType = typeof b;
//   if (aType === "string" && bType === "string") return a < b ? -Infinity : Infinity;
//   return +a - +b;
// }

export function search<T>(
  array: T[],
  value: T,
  compare: Comparator<T>,
  start?: number,
  end?: number
): number {
  start = start === undefined ? 0 : start;
  end = end === undefined ? array.length : end;

  if (start >= end) return start;

  const mid = (start + end) >> 1;
  if (compare(array[mid], value) < 0) {
    return search(array, value, compare, mid + 1, end);
  } else {
    return search(array, value, compare, start, mid);
  }
}

export class SortedArray<T> {
  private arr: T[];
  private compare: Comparator<T>;

  constructor(compare: Comparator<T>, a: T[] = []) {
    this.arr = [];
    this.compare = compare;

    a.forEach((item) => this.insert(item));
  }

  at(i: number): T {
    return this.arr[i];
  }

  insert(t: T) {
    const idx = search(this.arr, t, this.compare);
    this.arr.splice(idx, 0, t);
  }

  toArray(): T[] {
    return this.arr;
  }

  size(): number {
    return this.arr.length;
  }

  delete(t: T) {}
}
