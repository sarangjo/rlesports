import { scaleTime, ScaleTime } from "d3-scale";
import { addDays, differenceInCalendarDays } from "date-fns";
import * as Simple from "./yHandling/simple";
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

  constructor(
    players: Player[],
    teamColors: Record<string, string>,
    bounds: UIRectangle
  ) {
    this.players = players;
    this.teamColors = teamColors;
    this.bounds = bounds;

    // Set up our X/Y scales
    const { x, start, end } = this.setupX();
    this.x = x;
    this.start = start;
    this.end = end;
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
        `Somethin's wrong! start ${JSON.stringify(
          start
        )} or end ${JSON.stringify(end)} are undefined`
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
      {
        length:
          differenceInCalendarDays(s2d(this.end), s2d(this.start)) / 50 + 2,
      },
      (_, i) => f(addDays(s2d(this.start), i * 50))
    ).concat([f(s2d(this.end))]);
  }

  process(): Output {
    return {
      players: Simple.processPlayers(this.players, this.x),
      dates: this.processDates(),
    };
  }
}
