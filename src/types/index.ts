// Types relating to the RL Esports overall data

import { SimpleDate } from "./datetime";

export enum EventType {
  JOIN = "join",
  LEAVE = "leave",
}

export enum MembershipType {
  MEMBER,
  NOT_MEMBER,
}

export interface Membership {
  team: string;
  join: SimpleDate;
  leave?: SimpleDate;
}

export interface Player {
  name: string;
  memberships: Membership[];
}

export interface Team {
  name: string;
  // TODO: do we need this? we should piece together membership from player events
  players: string[];
  subs?: string[] | null;
  region: Region;
  metadata?: any;
  won?: boolean;
  color?: string;
}

export interface Tournament {
  region: Region;
  name: string;
  start: string;
  end: string;
  teams: Team[];
}

export interface Section {
  name: string;
  tournaments: Tournament[];
}

export interface RlcsSeason {
  season: string;
  sections: Section[];
}

// TODO remove "WORLD" and replace with a collection of regions
export enum Region {
  NONE,
  WORLD,
  NORTH_AMERICA,
  EUROPE,
  OCEANIA,
  SOUTH_AMERICA,
}

export enum Viz {
  SANKEY = "sankey",
  TEAM_MAP = "team-map",
  FORCE_GRAPH = "force-graph",
  TOURNAMENTS = "simple",
  TABLE = "table",
  TEXT = "text",
  TIMELINE = "timeline",
  TOURNEY_TEAMS = "tourney-teams",
}

export const VizTitle = {
  [Viz.SANKEY]: "Sankey",
  [Viz.TEAM_MAP]: "Team Map",
  [Viz.FORCE_GRAPH]: "Force Graph",
  [Viz.TOURNAMENTS]: "Simple",
  [Viz.TABLE]: "Table",
  [Viz.TEXT]: "Text",
  [Viz.TIMELINE]: "Timeline",
  [Viz.TOURNEY_TEAMS]: "Tourney Teams",
};
