import { map, pickBy } from "lodash";

/** Data utilities. Think of these functions as sliding right into `lodash`, for example. */

export function getIndices<T>(items: T[], stringifier: (t: T) => string): Record<string, number> {
  return items.reduce((acc, t, i) => {
    acc[stringifier(t)] = i;
    return acc;
  }, {} as Record<string, number>);
}

// Map numerical enum
export const mapEnum = (x: any, iter: (val: number, key: string) => any) => {
  return map(
    pickBy(x, (val) => {
      return typeof val === "number";
    }),
    iter,
  );
};

export function ordinalSuffixOf(i: number): string {
  const j = i % 10,
    k = i % 100;
  if (j === 1 && k !== 11) {
    return i + "st";
  }
  if (j === 2 && k !== 12) {
    return i + "nd";
  }
  if (j === 3 && k !== 13) {
    return i + "rd";
  }
  return i + "th";
}
