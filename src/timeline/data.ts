import { scaleTime, ScaleTime } from "d3-scale";
import { addDays, differenceInCalendarDays } from "date-fns";
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
import { d2s, s2d } from "../util/datetime";
import {
  DEFAULT_COLOR,
  SPACING,
  UIPlayer,
  Radius,
  COLOR_NO_TEAM,
  FILL_LEAVE,
  STROKE_WIDTH_TEAM,
} from "./types";

class YScale {
  protected bounds: UIRectangle;

  constructor(bounds: UIRectangle) {
    this.bounds = bounds;
  }

  // TODO this signature finna be v interesting as we get more complex
  getY(_p: Player): number {
    throw new Error("Not implemented");
  }
}

/**
 * Simple Y Scale: just uses indices to stack players vertically.
 */
class SimpleYScale extends YScale {
  private indices: Record<string, number>;

  constructor(players: Player[], bounds: UIRectangle) {
    super(bounds);

    this.indices = getIndices(players, (p) => p.name);
  }

  override getY(p: Player): number {
    // Given a vertical index, what's its Y coordinate?
    return this.bounds.y + SPACING + this.indices[p.name] * 2 * SPACING;
  }
}

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
  private start: string;
  private end: string;

  private x: ScaleTime<number, number>;
  private y: YScale;

  constructor(players: Player[], teamColors: Record<string, string>, bounds: UIRectangle) {
    this.players = players;
    this.teamColors = teamColors;
    this.bounds = bounds;

    // Set up our X/Y scales
    const { x, start, end } = this.setupX();
    this.x = x;
    this.start = start;
    this.end = end;
    this.y = this.setupY();
  }

  private setupX() {
    // Calculating minimum and maximum:
    // [min/max] Try 1: events

    // Start is the earliest join of any player
    const start = this.players.reduce((acc, cur) => {
      // prettier-ignore
      return (!acc || cur.memberships[0]?.join < acc) ? cur.memberships[0]?.join : acc;
    }, "");

    const end = d2s(new Date());

    /*
    // End is the latest leave of any player, or now if there are no leaves
    this.players.reduce((acc, cur) => {
      const candidate = cur.memberships[cur.memberships.length - 1]?.leave || dateToStr(moment());

      return (!acc || candidate > acc) ? candidate : acc;
    }, ""); */

    if (!start || !end) {
      throw new Error(
        `Somethin's wrong! start ${JSON.stringify(start)} or end ${JSON.stringify(
          end
        )} are undefined`
      );
    }

    // [min/max] Try 2: tournaments
    // startDate = startDate > tournaments[0].start ? tournaments[0].start : startDate;
    // endDate = endDate < last(tournaments)!.end ? last(tournaments)!.end : endDate;

    return {
      x: scaleTime()
        .domain([s2d(start), s2d(end)])
        .range([this.bounds.x, this.bounds.x + this.bounds.width]),
      start,
      end,
    };
  }

  private setupY() {
    return new SimpleYScale(this.players, this.bounds);
  }

  private processPlayer(p: Player): UIPlayer {
    const uiP: UIPlayer = { events: [], memberships: [] };

    p.memberships.forEach((m, i) => {
      /* UI info for this m */

      const start: UIPoint = { x: this.x(s2d(m.join)), y: this.y.getY(p) };
      // If we have a leave, set that in the end point
      const end: UIPoint = {
        x: m.leave ? this.x(s2d(m.leave)) : this.bounds.x + this.bounds.width,
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
              x: this.x(s2d(p.memberships[i + 1].join)),
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
    const f = (m: Date): [UIText, UILine] => {
      const x = this.x(m);

      return [
        {
          x: x - SPACING / 2, // TODO arbitrary 5px adjustment
          y: 10, // TODO constant?
          text: d2s(m),
          orientation: TextOrientation.VERTICAL,
        } as UIText,
        {
          start: { x, y: 0 },
          end: { x, y: this.bounds.y + this.bounds.height },
          connectorType: ConnectorType.LINE,
          stroke: "green",
        } as UILine,
      ];
    };

    return Array.from(
      { length: differenceInCalendarDays(s2d(this.end), s2d(this.start)) / 50 + 2 },
      (_, i) => f(addDays(s2d(this.start), i * 50))
    ).concat([f(s2d(this.end))]);
  }

  process(): Output {
    return {
      players: this.players.map((p) => this.processPlayer(p)),
      dates: this.processDates(),
    };
  }
}
