import { ScaleTime } from "d3-scale";
import { Player } from "../../../types";
import { UIRectangle } from "../../../types/ui";
import { TeamSegmentListEvents as TeamSegmentList } from "./events";
import { UIPlayer } from "../../types";

export function processPlayers(
  players: Player[],
  x: ScaleTime<number, number>,
  bounds: UIRectangle,
  teamColors: Record<string, string>
): UIPlayer[] {
  // Start putting together a view of all team "versions", based on the players, which will loosely translate to "areas"
  const teamMap: Record<string, TeamSegmentList> = {};

  players.forEach((p) => {
    p.memberships.forEach((m) => {
      if (!(m.team in teamMap)) {
        teamMap[m.team] = new TeamSegmentList();
      }
      teamMap[m.team].insert(p.name, m.join, m.leave);
    });
  });

  // Alrighty, now we have team segments for each team. Each segment loosely translates into x values
  // Try 1 is using static placement with fuzzy overlaps

  // return players.map((p) => processPlayer(p, x, getY, bounds, teamColors));
  return [];
}
