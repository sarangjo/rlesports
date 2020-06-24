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
  start?: string;
  end?: string;
  teams: Team[];
}

// Graph types
export interface TeamNodePart {
  tournamentIndex: number;
}

export interface TournamentNode extends d3.SimulationNodeDatum {
  playerIndex: number;
  teamIndex: number;
  tournamentIndex: number;
  id: string; // combination of indices
}

export interface TournamentLink {
  source: TournamentNode;
  target: TournamentNode;
}

// TODO rename
export type SimulationLink = d3.SimulationLinkDatum<TournamentNode>;

export type Chart = d3.Selection<d3.BaseType, unknown, HTMLElement, any>;

export interface RLVisualization {
  main: (chart: Chart) => any;
}
