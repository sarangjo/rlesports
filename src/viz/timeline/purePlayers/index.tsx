import React, { useMemo, useState } from "react";
import { useUpdate } from "react-use";
import {
  ConnectorComponent,
  LineComponent,
  RectComponent,
  TextComponent,
} from "../../../components";
import { Player } from "../../../types";
import { UIRectangle } from "../../../types/svg";
import { PlayerComponent } from "../common";
import { MARGIN } from "../types";
import { DataProcessor } from "./processor";

export default function Timeline({
  players,
  teamColors,
  width,
  height,
}: {
  players: Player[];
  teamColors: Record<string, string>;
  width: number;
  height: number;
}) {
  const update = useUpdate();

  const bounds: UIRectangle = {
    x: MARGIN.left,
    y: MARGIN.top,
    width: width - MARGIN.left - MARGIN.right,
    height: height - MARGIN.top - MARGIN.bottom,
  };

  // Data processing
  const processor = useMemo(
    () => new DataProcessor(players, teamColors, bounds),
    [players, teamColors],
  );

  const dates = useMemo(() => processor.getDates(), [processor]);

  const [isSimple] = useState(false);
  const [isForce] = useState(true);

  if (isForce) {
    useMemo(() => processor.setupSimulation(update), [processor]);
  }

  return (
    <>
      <RectComponent {...bounds} />
      <g id="dates">
        {dates.map(([d, l], i) => (
          <React.Fragment key={i}>
            <TextComponent {...d} />
            <LineComponent {...l} />
          </React.Fragment>
        ))}
      </g>
      {isSimple ? (
        <g id="players">
          {processor.getSimplePlayers().map((p, i) => (
            <PlayerComponent player={p} key={i} />
          ))}
        </g>
      ) : isForce ? (
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
    </>
  );
}
