import { Player } from "../types";
import { TeamSegmentListEvents as TeamSegmentList } from "./teamSegments/events";

export function process(players: Player[]): Record<string, TeamSegmentList> {
  // Start putting together a view of all team "versions", based on the players, which will loosely translate to "areas"
  const teamMap: Record<string, TeamSegmentList> = {};

  players.forEach((p) => {
    p.memberships.forEach((m) => {
      // For this membership, find the team

      if (!(m.team in teamMap)) {
        teamMap[m.team] = new TeamSegmentList();
      }

      teamMap[m.team].insert(p.name, m.join, m.leave);
    });
  });

  return teamMap;
}
