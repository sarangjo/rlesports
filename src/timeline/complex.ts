import { Player } from "../types";

interface MemRange {
  players: string[];
  start: string;
  end: string;
}

export function process(players: Player[]) {
  // Start putting together a view of all team "versions", based on the players, which will loosely translate to "areas"
  const teamMap: Record<string, MemRange> = {};

  players.forEach((p) => {
    p.memberships.forEach((m) => {
      if (!(m.team in teamMap)) {
        teamMap[m.team] =
      }
    });
  });
}
