import { Player } from "../types";

// Each team has a LinkedList

interface TeamSegment {
  players: string[];
  start: string;
  end?: string;
}

export function process(players: Player[]) {
  // Start putting together a view of all team "versions", based on the players, which will loosely translate to "areas"
  const teamMap: Record<string, TeamSegment[]> = {};

  players.forEach((p) => {
    p.memberships.forEach((m) => {
      // For this membership, find the team

      if (!(m.team in teamMap)) {
        // Case 1: no team has been found yet
        // Cool, this is the first instance of this team we've seen; simply create the first node
        teamMap[m.team] = [{ players: [p.name], start: m.join, end: m.leave }];
        return;
      }

      // Case 2: we got a team baby!
      const teamSegments = teamMap[m.team];

      // Find where m lives in the segments
      teamSegments.forEach((s, i) => {
        if (m.join < s.start) {
          // We're before this segment. The only way we care about this is if our end intersects this segment
          if (!m.leave || m.leave > s.start) {
            // We intersect! Combine the two
            // Before, intersect, after
            // - before
            if (i === 0) {
              teamSegments.splice(i, 0, { players: [p.name], start: m.join, end: s.start });
            }

            // - intersect
            // --
            if (!s.end || (m.leave && m.leave < s.end)) {
              teamSegments.splice(i, 1, { players: s.players.concat(p.name), start: s.start, end:  })
            }
          }
        }

        if (s.start < m.join && (!s.end || m.join < s.end)) {
          //
        }
      });
    });
  });
}
