import { EventType } from "../types";
import { Color, UICircle, UIConnector, UIText } from "../types/ui";
import { SimpleDate } from "../util/datetime";

/* UI */

export const SPACING = 10;
export const DEFAULT_COLOR = "#000";
export const FILL_LEAVE: Color = "transparent";
export const COLOR_NO_TEAM: Color = "#bbbbbb";
export const STROKE_WIDTH_TEAM = 3;

export const Radius = {
  [EventType.JOIN]: 4,
  [EventType.LEAVE]: 6,
};

// TODO: there's no requirements that the coordinates of the events and segments line up whatsoever. Problem?
export interface UIPlayer {
  name?: UIText;
  events: UICircle[];

  // Note that this isn't necessarily 1:1 with actual membership changes. A single membership could comprise of multiple connectors
  connectors: UIConnector[];

  // events: UIPlayerEvent[];
  // memberships: UIMembership[];
}

/* TEAM SEGMENT */

export interface TeamSegment {
  players: string[];
  start: string;
  end?: string;
}

export function tsStr(s: TeamSegment): string {
  return `{ [${s.players.join(", ")}]: ${s.start} ${s.end || "X"} }`;
}

export function segmentsEqual(a: TeamSegment[], b: TeamSegment[]) {
  return (
    a.length === b.length &&
    a.every(
      (x: TeamSegment, i: number) =>
        x.players.sort() === b[i].players.sort() && x.start === b[i].start && x.end === b[i].end
    )
  );
}

// Hmm. A team could have a player leave and join on the same day. How that work?
// TODO handle off-by-one's

export interface TSL {
  insert(player: string, join: SimpleDate, leave?: SimpleDate): void;
  toString(): string;
  toArray(): TeamSegment[];
}
