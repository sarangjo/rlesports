import { Player } from "../types";
import { dateSub, SimpleDate } from "../util/datetime";
import SortedArray from "collections/sorted-array";

interface TeamSegment {
  players: string[];
  start: string;
  end?: string;
}

function tsStr(s: TeamSegment): string {
  return `{ ${s.players}: ${s.start}-${s.end || "X"} }`;
}

// Hmm. A team could have a player leave and join on the same day. How that work?
// TODO handle off-by-one's

class TeamSegmentList {
  private list: SortedArray.SortedArray<TeamSegment>;

  constructor() {
    this.list = new SortedArray<TeamSegment>(
      undefined,
      (a, b) => a.start === b.start,
      (a, b) => (a.start < b.start ? -1 : a.start === b.start ? 0 : 1)
    );
  }

  // Private helper to elide segments that have the same start and end
  private insertSegment(s: TeamSegment) {
    if (s.start === s.end) return;

    this.list.push(s);
  }

  insert(player: string, join: SimpleDate, leave?: SimpleDate) {
    const idx = 0;

    while (idx < this.list.length) {
      const s = this.list.get(idx);

      // If we're done inserting, speed through the rest
      if (inserted) return;

      // first compare join. This is really the first segment only, as segments that intersect before a non-first segment would be handled by the previous segment
      if (dateSub(join, s.start) < 0) {
        // where does it end (`leave`)?
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

          // Handle the intersection part

          // New segment with `player`
          this.insertSegment({ players: s.players.concat(player), start: s.start, end: leave });

          // Modify the current segment by bumping the start. But does this work?
          s.start = leave!;

          // Alternate approach: remove the current segment and replace with two segments
          // this.list.delete(s);
          // this.insertSegment({ players: s.players, start: strToMoment(leave) + 1,  })

          inserted = true;
          return;
        }

        // after - gotta look ahead

        // We're before this segment. The only way we care about this is if our end intersects this segment
        // if (!leave || leave > s.start) {
        //   // We intersect! Combine the two
        //   // Before, intersect, after
        //   // - before

        //   // - intersect
        //   // --
        //   if (!s.end || (leave && leave < s.end)) {
        //     // teamSegments.splice(i, 1, { players: s.players.concat(p.name), start: s.start, end:  })
        //   }
        // }
      }
    });

    // after it all, not inserted? Just insert and be done with it
    console.log("fallthru");
    this.insertSegment({ players: [player], start: join, end: leave });
  }

  toString(): string {
    return `[${this.list.length}]: ${this.list.reduce(
      (acc: string, cur: TeamSegment, idx: number): string => {
        return acc + (idx === 0 ? "" : ",") + tsStr(cur);
      },
      ""
    )}`;
  }
}

export function process(players: Player[]): Record<string, TeamSegmentList> {
  // Start putting together a view of all team "versions", based on the players, which will loosely translate to "areas"
  const teamMap: Record<string, TeamSegmentList> = {};

  players.forEach((p) => {
    console.log("Inserting", p);

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
