import moment from "moment";

const DATE_FORMAT = "YYYY-MM-DD";

export const toDate = (d: string): Date => moment(d, DATE_FORMAT).toDate();
export const now = (): string => moment().format(DATE_FORMAT);
