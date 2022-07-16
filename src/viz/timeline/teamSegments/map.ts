import SortedSet from "collections/sorted-set";
import { Player } from "../../../types";
import { TeamSegment, TeamSegmentLink, TeamSegmentNode } from "../types";
import { TeamSegmentListEvents } from "./list/events";
import { TSL } from "./list";

export type TeamSegmentMap = Record<string, TSL>;

export function constructTeamMap(
  players: Player[],
  TeamSegmentList = TeamSegmentListEvents,
): TeamSegmentMap {
  // Start putting together a view of all team "versions", based on the players, which will loosely translate to "areas"
  const teamMap: TeamSegmentMap = {};

  players.forEach((p) => {
    p.memberships.forEach((m) => {
      if (!(m.team in teamMap)) {
        teamMap[m.team] = new TeamSegmentList(m.team);
      }
      teamMap[m.team].insert(p.name, m.join, m.leave);
    });
  });

  return teamMap;
}

export function getSimRawNodesLinks(
  teamMap: TeamSegmentMap,
): [TeamSegmentNode[], TeamSegmentLink[]] {
  const nodes: TeamSegmentNode[] = [];
  const links: TeamSegmentLink[] = [];

  // Go through and create links by player.
  const playerSegmentMap: Record<string, SortedSet.SortedSet<TeamSegment>> = {};

  for (const team in teamMap) {
    const segments = teamMap[team];

    segments.forEach((seg) => {
      seg.players.forEach((p) => {
        // Do we have a latest segment we can add a link to?
        if (!(p in playerSegmentMap)) {
          playerSegmentMap[p] = new SortedSet<TeamSegment>(
            [],
            TeamSegment.isStartEqual,
            TeamSegment.compare,
          );
        }
        playerSegmentMap[p].push(seg);
      });

      nodes.push(seg);
    });
  }

  // now that we have all the links in order for player, we can actually create links

  for (const player in playerSegmentMap) {
    const arr = playerSegmentMap[player].toArray();
    for (let i = 0; i < arr.length - 1; i++) {
      links.push({
        source: arr[i],
        target: arr[i + 1],
      });
    }
  }

  return [nodes, links];
}
