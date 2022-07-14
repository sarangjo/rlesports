import { format, parse } from "date-fns";

export type SimpleDate = string;

const DATE_FORMAT = "yyyy-MM-dd";

export const s2d = (d: SimpleDate): Date => parse(d, DATE_FORMAT, new Date());
export const d2s = (d: Date): SimpleDate => format(d, DATE_FORMAT);

export const dateSub = (
  a: SimpleDate | undefined,
  b: SimpleDate | undefined
): number => {
  if (!a && !b) return 0;
  if (!b) return -1;
  if (!a) return 1;
  if (a < b) return -1;
  if (a === b) return 0;
  return 1;
};
