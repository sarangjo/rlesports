import moment from "moment";

const DATE_FORMAT = "YYYY-MM-DD";

export const strToDate = (d: string): Date => moment(d, DATE_FORMAT).toDate();
export const dateToStr = (d: moment.Moment): string => d.format(DATE_FORMAT);
