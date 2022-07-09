import { ScaleTime } from "d3";
import { scaleTime } from "d3-scale";
import moment from "moment";
import { EventType, Player } from "../types";
import {
  ConnectorType,
  TextAnchor,
  TextOrientation,
  UILine,
  UIPoint,
  UIRectangle,
  UIText,
} from "../types/ui";
import { getIndices } from "../util/data";
import { dateToStr, strToDate } from "../util/datetime";
import {
  DEFAULT_COLOR,
  SPACING,
  UIPlayer,
  Radius,
  COLOR_NO_TEAM,
  FILL_LEAVE,
  STROKE_WIDTH_TEAM,
} from "./types";

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
    return this.bounds.y + SPACING + this.indices[p.name] * 2 * SPACING;
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

export interface Output {
  players: UIPlayer[];
  dates: [UIText, UILine][];
}

export class DataProcessor {
  // Provided
  private players: Player[];
  private teamColors: Record<string, string>;
  private bounds: UIRectangle;

  // Calculated
  private start?: string;
  private end?: string;

  private x: ScaleTime<number, number>;
  private y: YComputer;

  constructor(players: Player[], teamColors: Record<string, string>, bounds: UIRectangle) {
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
    this.start = this.players?.reduce((acc, cur) => {
      return !acc || cur.memberships[0]?.join < acc ? cur.memberships[0]?.join : acc;
    }, "");
    // End is the latest leave of any player, or now if there are no leaves
    this.end = this.players?.reduce((acc, cur) => {
      const interim =
        cur.memberships?.length > 0 && cur.memberships[cur.memberships.length - 1].leave;
      const candidate = interim || dateToStr(moment());
      return !acc || candidate > acc ? candidate : acc;
    }, "");

    console.log("start", this.start, "end", this.end);

    if (!this.start || !this.end) {
      throw new Error(
        `Somethin's wrong! start ${JSON.stringify(this.start)} or end ${JSON.stringify(
          this.end
        )} are undefined`
      );
    }

    // [min/max] Try 2: tournaments
    // startDate = startDate > tournaments[0].start ? tournaments[0].start : startDate;
    // endDate = endDate < last(tournaments)!.end ? last(tournaments)!.end : endDate;

    return scaleTime()
      .domain([strToDate(this.start), strToDate(this.end)])
      .range([this.bounds.x, this.bounds.x + this.bounds.width]);
  }

  private setupY() {
    return new SimpleYComputer(this.players, this.bounds);
  }

  private processPlayer(p: Player): UIPlayer {
    const uiP: UIPlayer = { events: [], memberships: [] };

    p.memberships.forEach((m, i) => {
      /* UI info for this m */

      const start: UIPoint = { x: this.x(strToDate(m.join)), y: this.y.getY(p) };
      // If we have a leave, set that in the end point
      const end: UIPoint = {
        x: m.leave ? this.x(strToDate(m.leave)) : this.bounds.x + this.bounds.width,
        y: this.y.getY(p),
      };
      const color = this.teamColors[m.team] || DEFAULT_COLOR;

      /* Transform data */

      // Join
      uiP.events.push({
        center: start,
        radius: Radius[EventType.JOIN],
        stroke: color,
        fill: color,
      });
      // Leave
      if (m.leave) {
        uiP.events.push({
          center: end,
          radius: Radius[EventType.LEAVE],
          stroke: COLOR_NO_TEAM,
          fill: FILL_LEAVE,
        });

        // Line connecting to next join, if any
        if (i !== p.memberships.length - 1) {
          uiP.memberships.push({
            connectorType: ConnectorType.LINE,
            start: end,
            end: {
              x: this.x(strToDate(p.memberships[i + 1].join)),
              y: this.y.getY(p),
            },
            stroke: COLOR_NO_TEAM,
          } as UILine);
        }
      }

      // Membership
      uiP.memberships.push({
        start,
        end,
        stroke: color,
        connectorType: ConnectorType.LINE,
        strokeWidth: STROKE_WIDTH_TEAM,
      } as UILine);

      // Name
      if (i === 0) {
        uiP.name = {
          text: p.name,
          x: start.x - SPACING,
          y: start.y + SPACING / 2, // TODO arbitrary 5px adjustment
          anchor: TextAnchor.END,
          orientation: TextOrientation.HORIZONTAL,
        };
      }
    });

    return uiP;
  }

  private processDates(): [UIText, UILine][] {
    return Array.from({ length: moment(this.end).diff(this.start, "d") / 50 + 2 }, (_, i) => {
      const date = moment(this.start).add(i * 50, "d");
      const x = this.x(date.toDate());

      return [
        {
          x: x - SPACING / 2, // TODO arbitrary 5px adjustment
          y: 10, // TODO constant?
          text: dateToStr(date),
          orientation: TextOrientation.VERTICAL,
        } as UIText,
        {
          start: { x, y: 0 },
          end: { x, y: this.bounds.y + this.bounds.height },
          connectorType: ConnectorType.LINE,
          stroke: "green",
        } as UILine,
      ];
    });
  }

  process(): Output {
    return {
      players: this.players.map((p) => this.processPlayer(p)),
      dates: this.processDates(),
    };
  }
}
