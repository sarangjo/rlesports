import { Player } from "../types";
import { dateSub, SimpleDate, strToDate, strToMoment } from "../util/datetime";
import SortedSet from "collections/sorted-set";

interface TeamSegment {
  players: string[];
  start: string;
  end?: string;
}

// Hmm. A team could have a player leave and join on the same day. How that work?

class TeamSegmentList {
  private list: SortedSet.SortedSet<TeamSegment>;

  constructor() {
    this.list = new SortedSet<TeamSegment>(undefined, (a, b) => a.start === b.start, (a, b) => a.start < b.start ? -1 : a.start === b.start ? 0 : 1);
  }

  private insertSegment(s: TeamSegment) {
    if (s.start === s.end) return;

    this.list.add(s);
  }

  insert(player: string, join: SimpleDate, leave?: SimpleDate) {
    let inserted = false;

    this.list.forEach((s: TeamSegment) => {
      // If we're done inserting, speed through the rest
      if (inserted) return;

      // first compare m.join
      if (dateSub(join, s.start) < 0) {
        // This is really the first segment only.

        // where does m end?
        const startDiff = dateSub(leave, s.start);
        const endDiff = dateSub(leave, s.end);

        // ends before
        if (startDiff < 0) {
          this.insertSegment({ players: [player], start: join, end: leave });
          inserted = true;
          return;
        }

        // ends inside
        if (startDiff >= 0 && endDiff <= 0) {
          // Insert the "before" part.
          this.insertSegment({ players: [player], start: join, end: s.start });

          // Handle the intersection part - remove the current segment and replace with two segments
          this.insertSegment({ players: s.players.concat(player), start: s.start, end: leave });
          // this.list.delete(s);
          this.insertSegment({ players: s.players, start: strToMoment(leave) + 1,  })
        }

        // after - gotta look ahead
        if ()

        // We're before this segment. The only way we care about this is if our end intersects this segment
        if (!leave || leave > s.start) {
          // We intersect! Combine the two
          // Before, intersect, after
          // - before

          // - intersect
          // --
          if (!s.end || (leave && leave < s.end)) {
            teamSegments.splice(i, 1, { players: s.players.concat(p.name), start: s.start, end:  })
          }
        }
      }

      if (s.start < join && (!s.end || join < s.end)) {
        //
      }
    });
  }
}

export function process(players: Player[]): Record<string, TeamSegmentList>  {
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
