import { SimpleDate } from "../../../util/datetime";
import { TeamSegment } from "../../types";

export abstract class TSL {
  constructor(protected team: string) {}

  abstract insert(player: string, join: SimpleDate, leave?: SimpleDate): void;
  abstract toString(): string;
  abstract toArray(): TeamSegment[];
  abstract forEach(iter: (element: TeamSegment) => void): void;
}

export function isTeamSegmentListEqual(a: TeamSegment[], b: TeamSegment[]) {
  return (
    a.length === b.length && a.every((x: TeamSegment, i: number) => TeamSegment.isEqual(x, b[i]))
  );
}
