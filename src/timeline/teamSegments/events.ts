import SortedSet from "collections/sorted-set";
import { SimpleDate } from "../../util/datetime";
import { TSL, TeamSegment, tsStr } from "../types";

enum Change {
  JOIN,
  LEAVE,
}

interface PlayerEvent {
  change: Change;
  player: string;
}

interface TeamEvent {
  date: SimpleDate;
  playerDiff: PlayerEvent[];
}

export class TeamSegmentListEvents implements TSL {
  private list: SortedSet.SortedSet<TeamEvent>;

  constructor() {
    this.list = new SortedSet<TeamEvent>(
      [],
      (a, b) => a.date === b.date,
      (a, b) => (a.date < b.date ? -1 : a.date === b.date ? 0 : 1)
    );
  }

  private addFn(d: SimpleDate, c: Change, player: string) {
    const ev = this.list.get({ date: d, playerDiff: [] });

    const obj: PlayerEvent = { change: c, player };

    if (ev) {
      ev.playerDiff.push(obj);
    } else {
      this.list.add({
        date: d,
        playerDiff: [obj],
      });
    }
  }

  insert(player: string, join: SimpleDate, leave?: SimpleDate) {
    // Join
    this.addFn(join, Change.JOIN, player);
    if (leave) {
      this.addFn(leave, Change.LEAVE, player);
    }
  }

  toString(): string {
    const arr = this.toArray();

    return `[${arr.length}]: ${arr.reduce(
      (acc: string, cur: TeamSegment, idx: number): string => {
        return acc + "\n" + tsStr(cur);
      },
      ""
    )}`;
  }

  toArray(): TeamSegment[] {
    const segments: TeamSegment[] = [];

    let prevVal: TeamEvent;

    const iterator = this.list.iterate();

    const prev = iterator.next();
    if (prev.done) return segments;
    prevVal = Object.assign({}, prev.value);

    const curPlayers: Set<string> = new Set<string>();
    for (let curr = iterator.next(); !curr.done; curr = iterator.next()) {
      // Process all of `prev` into curPlayers
      prevVal.playerDiff.forEach((ev) => {
        if (ev.change === Change.JOIN) {
          curPlayers.add(ev.player);
        } else {
          curPlayers.delete(ev.player);
        }
      });

      if (curPlayers.size > 0) {
        segments.push({
          players: Array.from(curPlayers),
          start: prevVal.date,
          end: curr.value!.date,
        });
      }

      prevVal = Object.assign({}, curr.value);
    }

    // Add the remainder of prev with no leaves
    prevVal.playerDiff.forEach((ev) => {
      if (ev.change === Change.JOIN) {
        curPlayers.add(ev.player);
      } else {
        curPlayers.delete(ev.player);
      }
    });
    if (curPlayers.size > 0) {
      segments.push({
        players: Array.from(curPlayers),
        start: prevVal.date,
      });
    }
    return segments;
  }
}
