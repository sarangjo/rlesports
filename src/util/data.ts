export function getIndices<T>(
  items: T[],
  stringifier: (t: T) => string
): Record<string, number> {
  return items.reduce((acc, t, i) => {
    acc[stringifier(t)] = i;
    return acc;
  }, {} as Record<string, number>);
}
