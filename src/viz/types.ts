import { Team, Tournament } from "../types";

export interface Link {
  from: { tournament: string; team: string };
  to: { tournament: string; team: string };
  players: string[];
}

// UI types

export interface UITournament extends Tournament {
  x: number;
  width: number;
  y: number;
  // height is TEAM_HEIGHT * teams.length
  teams: UITeam[];
}

export interface UITeam extends Team {
  x: number;
  width: number;
  y: number;
  // height is TEAM_HEIGHT
}

export interface UILink extends Link {
  fromX: number;
  fromTopY: number;
  fromBottomY: number;

  toX: number;
  toTopY: number;
  toBottomY: number;

  fill: string;
}

export interface Gradient {
  from?: string;
  to?: string;
}
