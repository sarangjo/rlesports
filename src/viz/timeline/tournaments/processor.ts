import { scaleTime, ScaleTime } from "d3-scale";
import { differenceInCalendarDays, addDays } from "date-fns";
import { RlcsSeason, Tournament } from "../../../types";
import { ConnectorType, TextOrientation, UILine, UIRectangle, UIText } from "../../../types/svg";
import { d2s, s2d } from "../../../util/datetime";
import { tournamentMap } from "../../../util/tournaments";
import { PLAYER_HEIGHT, TEXT_HEIGHT } from "../types";

export class DataProcessor {
  private tournaments: Tournament[];
  private start: string;
  private end: string;

  private x: ScaleTime<number, number>;

  constructor(
    seasons: RlcsSeason[],
    private teamColors: Record<string, string>,
    private bounds: UIRectangle,
  ) {
    this.tournaments = tournamentMap(seasons, (t) => t);

    const { x, start, end } = this.setupX();
    this.x = x;
    this.start = start;
    this.end = end;
  }

  private setupX() {
    // Calculating minimum and maximum:

    // [min/max] tournaments
    const start = this.tournaments[0].start;
    const end = this.tournaments[this.tournaments.length - 1].end;

    return {
      x: scaleTime()
        .domain([s2d(start), s2d(end)])
        .range([this.bounds.x, this.bounds.x + this.bounds.width]),
      start,
      end,
    };
  }

  public getBundledSegments(): [UIRectangle, UIText][] {
    // We start off with bundled segments that directly come from tournaments
    return this.tournaments.reduce((acc, tournament) => {
      const startX = this.x(s2d(tournament.start));
      const endX = this.x(s2d(tournament.end));

      tournament.teams.forEach((team) => {
        const y = Math.random() * this.bounds.height + this.bounds.y;

        // TODO: Extract this into a function
        acc.push([
          {
            x: startX,
            width: endX - startX,
            height: team.players.length * PLAYER_HEIGHT,
            y,
          },
          {
            orientation: TextOrientation.HORIZONTAL,
            text: `${team.name} at ${tournament.name}`,
            x: startX,
            y,
          },
        ]);
      });

      return acc;
    }, [] as [UIRectangle, UIText][]);
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
