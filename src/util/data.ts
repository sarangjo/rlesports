import { map, pickBy } from "lodash";

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
