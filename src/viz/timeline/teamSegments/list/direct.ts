import SortedSet from "collections/sorted-set";
import { SimpleDate, dateSub } from "../../../util/datetime";
import { TeamSegment } from "../../types";
import { TSL } from ".";

export class TeamSegmentListDirect extends TSL {
  private list: SortedSet.SortedSet<TeamSegment>;

  constructor(protected team: string) {
    super(team);

    this.list = new SortedSet<TeamSegment>([], TeamSegment.isStartEqual, TeamSegment.compare);
  }

  // Private helper to elide segments that have the same start and end
  private insertSegment(s: TeamSegment) {
    if (s.start === s.end) return;

    this.list.push(s);
  }

  insert(player: string, join: SimpleDate, leave?: SimpleDate) {
    const iterator = this.list.iterate();

    // Step 1: find the starting point. this could be before.

    let iter = iterator.next();

    while (!iter.done) {
      if (!iter.value) {
        throw new Error("s is undefined");
      }

      // first compare join. This is really the first segment only, as segments that intersect before a non-first segment would be handled by the previous segment
      if (dateSub(join, iter.value.start) < 0) {
        // where does it end (`leave`)?
        const leaveMinusStart = dateSub(leave, iter.value.start);

        // ends before
        if (leaveMinusStart < 0) {
          this.insertSegment({ team: this.team, players: [player], start: join, end: leave });
          return;
        }

        // we got here, so it ends after us.

        // Insert the "before" part.
        this.insertSegment({
          team: this.team,
          players: [player],
          start: join,
          end: iter.value.start,
        });
        break;
      } else if (dateSub(join, iter.value.end) < 0) {
        // Aha, it may not start before us, but it starts inside us. So we do the fancy intersection stuff.
        this.list.delete(iter.value);

        // pre-section
        this.insertSegment({
          team: this.team,
          players: iter.value.players,
          start: iter.value.start,
          end: join,
        });

        // intersection
        this.insertSegment({
          team: this.team,
          players: iter.value.players.concat(player),
          start: join,
          end: iter.value.end,
        });
        break;
      }

      // Sadge, we have no involvement at all. Basset hound.
      iter = iterator.next();
    }

    // Step 2: Now where does it end?

    // Iterate through the next segments until we find where it ends
    let curStart = join;
    while (!iter.done && dateSub(leave, iter.value!.end) > 0) {
      // This one wholly consumes it! Ruh roh!
      iter.value!.players.push(player);

      // `end` here must be defined; if it was not defined, the while condiiton would fail and we'd quit out
      curStart = iter.value!.end!;

      // And onward and upward!
      iter = iterator.next();
    }

    // we found where it ends! but... does is the endpoint in a segment?
    if (!iter.done) {
      // Found the segment that does it! Split this shit up

      // Remove the current segment and replace with 3 segments overall
      this.list.delete(iter.value!);

      // New segment with `player`
      this.insertSegment({
        team: this.team,
        players: iter.value!.players.concat(player),
        start: iter.value!.start,
        end: leave,
      });

      // Remaining segment after intersection
      this.insertSegment({
        team: this.team,
        players: iter.value!.players,
        start: leave!,
        end: iter.value!.end,
      });

      // Finally done!
      return;
    }

    // Reached the end - this means we're past the end, so just add what's leftover
    this.insertSegment({
      team: this.team,
      players: [player],
      start: curStart,
      end: leave,
    });
  }

  toString(): string {
    return `[${this.list.length}]: ${this.list
      .toArray()
      .reduce((acc: string, cur: TeamSegment, idx: number): string => {
        return acc + (idx === 0 ? "" : ",") + cur.toString();
      }, "")}`;
  }

  toArray(): TeamSegment[] {
    return this.list.toArray();
  }

  forEach(iter: (element: TeamSegment) => void): void {
    this.list.forEach(iter);
  }
}
