import { ScaleTime } from "d3";
import { scaleTime } from "d3-scale";
import { EventType, MembershipType, Player } from "../types";
import { SegmentType, UIRectangle } from "../types/ui";
import { getIndices } from "../util/data";
import { now, toDate } from "../util/datetime";
import { SPACING, UIMembership, UIPlayer, UIPlayerEvent } from "./types";

interface YComputer {
  // TODO this signature finna be v interesting as we get more complex
  getY(p: Player): number;
}

/**
 * Simple Y Computer: just uses indices to stack players vertically.
 */
class SimpleYComputer implements YComputer {
  private indices: Record<string, number>;
  private bounds: UIRectangle;

  constructor(players: Player[], bounds: UIRectangle) {
    this.indices = getIndices(players, (p) => p.name);
    this.bounds = bounds;
  }

  getY(p: Player): number {
    // Given a vertical index, what's its Y coordinate?
    return this.bounds.y + this.indices[p.name] * 2 * SPACING;
  }
}

/*
 * SAMPLE[
  {
    events: [
      {
        x: 10,
        y: 10,
        color: "#802b26",
        eventType: EventType.JOIN,
      },
    ],
    memberships: [
      {
        start: { x: 10, y: 10 },
        end: { x: 500, y: 10 },
        color: "#802b26",
        segmentType: SegmentType.LINE,
        membershipType: MembershipType.MEMBER,
      },
    ],
  },
];
*/

export class DataProcessor {
  private players: Player[];
  private teamColors: Record<string, string>;
  private bounds: UIRectangle;

  private x: ScaleTime<number, number>;
  private y: YComputer;

  constructor(
    players: Player[],
    teamColors: Record<string, string>,
    bounds: UIRectangle
  ) {
    this.players = players;
    this.teamColors = teamColors;
    this.bounds = bounds;

    // Set up our X/Y scales
    this.x = this.setupX();
    this.y = this.setupY();
  }

  private setupX() {
    // Calculating minimum and maximum:
    // [min/max] Try 1: events
    // Start is the earliest join of any player
    const start: string = this.players?.reduce((acc, cur) => {
      return !acc || cur.memberships[0]?.join < acc
        ? cur.memberships[0]?.join
        : acc;
    }, "");
    // End is the latest leave of any player, or now if there are no leaves
    const end: string = this.players?.reduce((acc, cur) => {
      const interim =
        cur.memberships?.length > 0 &&
        cur.memberships[cur.memberships.length - 1].leave;
      const candidate = interim || now();
      return !acc || candidate > acc ? candidate : acc;
    }, "");

    console.log("start", start, "end", end);

    if (!start || !end) {
      throw new Error(
        `Somethin's wrong! start ${JSON.stringify(
          start
        )} or end ${JSON.stringify(end)} are undefined`
      );
    }

    // [min/max] Try 2: tournaments
    // startDate = startDate > tournaments[0].start ? tournaments[0].start : startDate;
    // endDate = endDate < last(tournaments)!.end ? last(tournaments)!.end : endDate;

    return scaleTime()
      .domain([toDate(start), toDate(end)])
      .range([this.bounds.x, this.bounds.width]);
  }

  private setupY() {
    return new SimpleYComputer(this.players, this.bounds);
  }

  private processPlayer(p: Player) {
    const events: UIPlayerEvent[] = [];
    const memberships: UIMembership[] = [];

    p.memberships.forEach((m, i) => {
      /* UI info for this m */
      const start = { x: this.x(toDate(m.join)), y: this.y.getY(p) };
      // If we have a leave, set that in the end point
      const end = {
        x: m.leave
          ? this.x(toDate(m.leave))
          : this.bounds.x + this.bounds.width,
        y: this.y.getY(p),
      };
      const color = this.teamColors[m.team];

      // Join
      events.push({ ...start, color, eventType: EventType.JOIN });
      // Leave
      if (m.leave) {
        events.push({ ...end, color, eventType: EventType.LEAVE });

        // Line connecting to next join, if any
        if (i !== p.memberships.length - 1) {
          memberships.push({
            start: end,
            end: {
              x: this.x(toDate(p.memberships[i + 1].join)),
              y: this.y.getY(p),
            },
            segmentType: SegmentType.LINE,
            membershipType: MembershipType.NOT_MEMBER,
          });
        }
      }

      // Membership
      memberships.push({
        start,
        end,
        color,
        segmentType: SegmentType.LINE,
        membershipType: MembershipType.MEMBER,
      });
    });

    return { events, memberships } as UIPlayer;
  }

  process(): UIPlayer[] {
    return this.players.map((p) => this.processPlayer(p));
  }
}
