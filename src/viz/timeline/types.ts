import { EventType } from "../types";
import { Color, UICircle, UIConnector, UIText } from "../types/ui";
import { SimpleDate } from "../util/datetime";

/* UI */

export const BUFFER = 10; // for margins, keeping things away from the harsh borders
export const TEXT_HEIGHT = 10;
export const PLAYER_HEIGHT = 20;

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

export class TeamSegment {
  constructor(
    public team: string,
    public players: string[],
    public start: string,
    public end?: string
  ) {}

  public static isStartEqual(a: TeamSegment, b: TeamSegment) {
    return a.start === b.start;
  }

  public static isEqual(a: TeamSegment, b: TeamSegment) {
    return a.players.sort() === b.players.sort() && a.start === b.start && a.end === b.end;
  }

  public static compare(a: TeamSegment, b: TeamSegment): number {
    return a.start < b.start ? -1 : a.start === b.start ? 0 : 1;
  }

  public toString(): string {
    return `{ <${this.team}> [${this.players.join(", ")}]: ${this.start} ${this.end || "X"} }`;
  }
}

// Hmm. A team could have a player leave and join on the same day. How that work?
// TODO handle off-by-one's

export type TeamSegmentNode = d3.SimulationNodeDatum & TeamSegment;
export type TeamSegmentLink = d3.SimulationLinkDatum<TeamSegmentNode>;
export type TeamSegmentSimulation = d3.Simulation<TeamSegmentNode, TeamSegmentLink>;
