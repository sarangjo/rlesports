// Data types
export interface Team {
  name: string;
  players: string[];
  subs?: string[] | null;
  region: Region;
  metadata?: any;
  won?: boolean;
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

export interface OldTournament {
  // Metadata
  season: string;
  region: Region;
  index: number;
  // Name
  name: string;
  // LP data
  start: string;
  end: string;
  teams: Team[];
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

export interface Membership {
  team: string;
  join: string;
  leave?: string;
}

export interface Player {
  name: string;
  memberships: Membership[];
  alternateIDs?: string[] | null;
}

export enum EventType {
  JOIN = "join",
  LEAVE = "leave",
}

// Graph types
export interface TeamNodePart {
  tournamentIndex: number;
}

export interface TournamentPlayerNode extends d3.SimulationNodeDatum {
  playerIndex: number;
  teamIndex: number;
  tournamentIndex: number;
  id: string; // combination of indices
}

export interface TournamentLink {
  source: TournamentPlayerNode;
  target: TournamentPlayerNode;
}

// TODO rename
export type SimulationLink = d3.SimulationLinkDatum<TournamentPlayerNode>;

export type Chart = d3.Selection<d3.BaseType, unknown, SVGElement, any>;

export interface RLVisualization {
  main: (chart: Chart) => any;
}
