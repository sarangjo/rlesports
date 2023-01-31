import { scaleTime, ScaleTime } from "d3";
import { differenceInCalendarDays, addDays } from "date-fns";
import { WIDTH, HEIGHT } from "../constants";
import { EventType, Player } from "../types";
import {
  ConnectorType,
  TextAnchor,
  TextOrientation,
  UILine,
  UIPoint,
  UIRectangle,
  UIText,
} from "../types/svg";
import {
  BUFFER,
  FILL_LEAVE,
  PLAYER_HEIGHT,
  Radius,
  STROKE_WIDTH_TEAM,
  TEXT_HEIGHT,
  UIPlayer,
} from "../viz/timeline/types";
import { getTeamColor, COLOR_NO_TEAM } from "./colors";
import { getIndices } from "./data";
import { d2s, s2d } from "./datetime";

export const TIMELINE_MARGIN = { left: 75, top: 100, right: 10, bottom: 10 };

export const TIMELINE_BOUNDS: UIRectangle = {
  x: TIMELINE_MARGIN.left,
  y: TIMELINE_MARGIN.top,
  width: WIDTH - TIMELINE_MARGIN.left - TIMELINE_MARGIN.right,
  height: HEIGHT - TIMELINE_MARGIN.top - TIMELINE_MARGIN.bottom,
};

export abstract class BaseTimelineProcessor {
  protected start: string;
  protected end: string;

  protected x: ScaleTime<number, number>;

  constructor(protected bounds: UIRectangle) {
    // Set up our X/Y scales
    const { x, start, end } = this.setupX();
    this.x = x;
    this.start = start;
    this.end = end;
  }

  protected abstract setupStartEnd(): { start: string; end: string };

  public setupX() {
    const { start, end } = this.setupStartEnd();
    if (!start || !end) {
      throw new Error(
        `Somethin's wrong! start ${JSON.stringify(start)} or end ${JSON.stringify(
          end,
        )} are undefined`,
      );
    }

    return {
      x: scaleTime()
        .domain([s2d(start), s2d(end)])
        .range([this.bounds.x, this.bounds.x + this.bounds.width]),
      start,
      end,
    };
  }

  public getDates(): [UIText, UILine][] {
    const f = (m: Date): [UIText, UILine] => {
      const x = this.x(m);

      return [
        {
          x: x - TEXT_HEIGHT / 2,
          y: TEXT_HEIGHT,
          text: d2s(m),
          orientation: TextOrientation.VERTICAL,
        } as UIText,
        {
          start: { x, y: this.bounds.y },
          end: { x, y: this.bounds.y + this.bounds.height },
          connectorType: ConnectorType.LINE,
          stroke: "green",
        } as UILine,
      ];
    };

    return Array.from(
      {
        length: differenceInCalendarDays(s2d(this.end), s2d(this.start)) / 50 + 2,
      },
      (_, i) => f(addDays(s2d(this.start), i * 50)),
    ).concat([f(s2d(this.end))]);
  }
}

export class PlayerTimelineProcessor extends BaseTimelineProcessor {
  constructor(
    protected players: Player[],
    protected teamColors: Record<string, string>,
    bounds: UIRectangle,
  ) {
    super(bounds);
  }

  protected override setupStartEnd(): { start: string; end: string } {
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

    // [min/max] Try 2: tournaments
    // startDate = startDate > tournaments[0].start ? tournaments[0].start : startDate;
    // endDate = endDate < last(tournaments)!.end ? last(tournaments)!.end : endDate;

    return { start, end };
  }
}

export class SimpleTimelineProcessor extends PlayerTimelineProcessor {
  public getSimplePlayers(): UIPlayer[] {
    const indices = getIndices(this.players, (p) => p.name);
    const getY = (p: Player) => this.bounds.y + BUFFER + indices[p.name] * PLAYER_HEIGHT;

    return this.players.map((p) => this.processPlayer(p, getY));
  }

  private processPlayer(p: Player, getY: (p: Player) => number): UIPlayer {
    const uiP: UIPlayer = { events: [], connectors: [] };

    p.memberships.forEach((m, i) => {
      /* UI info for this m */

      const start: UIPoint = { x: this.x(s2d(m.join)), y: getY(p) };
      // If we have a leave, set that in the end point
      const end: UIPoint = {
        x: m.leave ? this.x(s2d(m.leave)) : this.bounds.x + this.bounds.width,
        y: getY(p),
      };
      const color = getTeamColor(m.team, this.teamColors);

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
          uiP.connectors.push({
            connectorType: ConnectorType.LINE,
            start: end,
            end: {
              x: this.x(s2d(p.memberships[i + 1].join)),
              y: getY(p),
            },
            stroke: COLOR_NO_TEAM,
          } as UILine);
        }
      }

      // Membership
      uiP.connectors.push({
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
          x: start.x - BUFFER,
          y: start.y + TEXT_HEIGHT / 2, // TODO arbitrary 5px adjustment
          anchor: TextAnchor.END,
          orientation: TextOrientation.HORIZONTAL,
        };
      }
    });

    return uiP;
  }
}
