// Data types
export interface Team {
  name: string;
  players: string[];
  won?: boolean;
  subs?: string[];
  metadata?: any;
}

export interface Tournament {
  name: string;
  start: string;
  end: string;
  teams: Team[];
  region: Region;
}

export enum EventType {
  JOIN = "join",
  LEAVE = "leave",
}

export interface PlayerEvent {
  team: string;
  join: string;
  leave?: string;
}

export enum Region {
  NONE,
  WORLD,
  NORTH_AMERICA,
  EUROPE,
  OCEANIA,
  SOUTH_AMERICA,
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
