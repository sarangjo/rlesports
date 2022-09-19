import { scaleTime, ScaleTime } from "d3-scale";
import { RlcsSeason, Tournament } from "../../../types";
import { TextOrientation, UIRectangle, UIText } from "../../../types/svg";
import { s2d } from "../../../util/datetime";
import { tournamentMap } from "../../../util/tournaments";
import { PLAYER_HEIGHT } from "../types";

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
}
