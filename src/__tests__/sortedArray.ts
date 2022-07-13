import { Comparator, search } from "../util/sortedArray";

const strComp: Comparator<string> = (a, b) => (a < b ? -Infinity : Infinity);

test("works on empty", () => {
  const arr: number[] = [];
  expect(search(arr, 1, (a, b) => a - b)).toBe(0);
});

test("works on 1 elem", () => {
  const arr = ["a", "b", "d"];
  expect(search(arr, "c", strComp)).toBe(2);
  expect(search(arr, "a", strComp)).toBe(0);
  expect(search(arr, "b", strComp)).toBe(1);
});
