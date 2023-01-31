import React, { useMemo } from "react";
import { useUpdate } from "react-use";
import {
  CircleComponent,
  ConnectorComponent,
  LineComponent,
  RectComponent,
  TextComponent,
} from "../../components";
import { HEIGHT, WIDTH } from "../../constants";
import { Player } from "../../types";
import { TIMELINE_BOUNDS } from "../../util/timeline";
import { TeamSegmentTimelineProcessor } from "./teamSegments/data";
import { UIPlayer } from "./types";

function PlayerComponent({ player }: { player: UIPlayer }) {
  return (
    <>
      {player.name && <TextComponent {...player.name} />}
      {player.connectors.map((s, i) => (
        <ConnectorComponent key={i} {...s} />
      ))}
      {player.events.map((e, i) => (
        <CircleComponent key={i} {...e} />
      ))}
    </>
  );
}

const isForce = true;

// TODO: unify this with TourneyTeams better lol
export default function Timeline({
  players,
  teamColors,
}: {
  players: Player[];
  teamColors: Record<string, string>;
}) {
  const update = useUpdate();

  // Data processing
  const processor = useMemo(
    () => new TeamSegmentTimelineProcessor(players, teamColors, TIMELINE_BOUNDS),
    [players, teamColors],
  );

  const dates = useMemo(() => processor.getDates(), [processor]);

  if (isForce) {
    useMemo(() => processor.setupSimulation(update), [processor]);
  }

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
      {/* {isSimple ? (
        <g id="players">
          {processor.getSimplePlayers().map((p, i) => (
            <PlayerComponent player={p} key={i} />
          ))}
        </g> ) : */}
      {isForce ? (
        <>
          <g id="segments">
            {processor.getSimNodeRects().map(([r, t], i) => (
              <React.Fragment key={i}>
                <RectComponent {...r} />
                <TextComponent {...t} />
              </React.Fragment>
            ))}
          </g>
          <g id="segmentlinks">
            {processor.getSimLinks().map((c, i) => (
              <ConnectorComponent key={i} {...c} />
            ))}
          </g>
        </>
      ) : (
        <g id="segments">
          {processor.getTSRectangles().map(([r, t], i) => (
            <React.Fragment key={i}>
              <RectComponent {...r} />
              <TextComponent {...t} />
            </React.Fragment>
          ))}
        </g>
      )}
    </svg>
  );
}
