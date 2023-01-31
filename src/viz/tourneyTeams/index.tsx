import React, { useMemo } from "react";
import { LineComponent, RectComponent, TextComponent } from "../../components";
import { WIDTH, HEIGHT } from "../../constants";
import { RlcsSeason } from "../../types";
import { TIMELINE_BOUNDS } from "../../util/timeline";
import { TourneyTeamsTimelineProcessor } from "./data";

export default function TourneyTeams({
  seasons,
  teamColors,
}: {
  seasons: RlcsSeason[];
  teamColors: Record<string, string>;
}) {
  const processor = useMemo(
    () => new TourneyTeamsTimelineProcessor(seasons, teamColors, TIMELINE_BOUNDS),
    [seasons, teamColors],
  );

  const dates = useMemo(() => processor.getDates(), [processor]);
  const tournaments = useMemo(() => processor.getTournamentRectangles(), [processor]);

  return (
    <svg width={WIDTH} height={HEIGHT}>
      <RectComponent {...TIMELINE_BOUNDS} />
      <g id="dates">
        {dates.map(([d, l], i) => (
          <React.Fragment key={i}>
            <TextComponent {...d} />
            <LineComponent {...l} />
          </React.Fragment>
        ))}
      </g>
      <g id="tournaments">
        {tournaments.map((r, i) => (
          <RectComponent key={i} {...r} />
        ))}
      </g>
    </svg>
  );
}
