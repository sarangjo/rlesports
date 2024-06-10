import { format, parse } from "date-fns";
import { SimpleDate } from "../types";

const DATE_FORMAT = "yyyy-MM-dd";

export const s2d = (d: SimpleDate): Date => parse(d, DATE_FORMAT, new Date());
export const d2s = (d: Date): SimpleDate => format(d, DATE_FORMAT);
