import { differenceInDays } from "date-fns";
import { RlcsSeason } from "../../types";
import { UIRectangle } from "../../types/svg";
import { d2s, s2d } from "../../util/datetime";
import { BaseTimelineProcessor } from "../../util/timeline";
import { tournamentMap } from "../../util/tournaments";

export class TourneyTeamsTimelineProcessor extends BaseTimelineProcessor {
  constructor(
    protected seasons: RlcsSeason[],
    protected teamColors: Record<string, string>,
    bounds: UIRectangle,
  ) {
    super(bounds);
  }

  protected setupStartEnd(): { start: string; end: string } {
    let start = d2s(new Date());
    tournamentMap(this.seasons, (t) => {
      start = t.start < start ? t.start : start;
    });

    const end = d2s(new Date());

    return {
      start,
      end,
    };
  }

  public getTournamentRectangles() {
    return tournamentMap(
      this.seasons,
      (t) =>
        ({
          x: this.x(s2d(t.start)),
          y: 30,
          width: differenceInDays(s2d(t.end), s2d(t.start)),
          height: 30 * t.teams.length,
          color: "grey",
        } as UIRectangle),
    );
  }
}
