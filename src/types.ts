export interface Team {
  name: string;
  players: string[];
  won?: boolean;
  subs?: string[];
}

export interface TeamNodePart {
  tournamentIndex: number;
}

export interface Tournament {
  name: string;
  start: string;
  end: string;
  teams: Team[];
}

export interface TournamentNode extends d3.SimulationNodeDatum {
  playerIndex: number;
  teamIndex: number;
  tournamentIndex: number;
  id: string; // combination of indices
}

export interface Link {
  source: TournamentNode;
  target: TournamentNode;
}

// TODO rename
export type SimulationLink = d3.SimulationLinkDatum<TournamentNode>;

export type Chart = d3.Selection<d3.BaseType, unknown, HTMLElement, any>;

export interface RLVisualization {
  // TODO move to constructor
  process: (data: any) => void;
  draw: (chart: Chart) => any;
}
