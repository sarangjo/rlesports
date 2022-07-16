import React, { useMemo, useState } from "react";
import { useUpdate } from "react-use";
import {
  CircleComponent,
  ConnectorComponent,
  LineComponent,
  RectComponent,
  TextComponent,
} from "../../components";
import { Player } from "../../types";
import { UIRectangle } from "../../types/svg";
import { DataProcessor } from "./data";
import { UIPlayer } from "./types";

const MARGIN = { left: 75, top: 100, right: 10, bottom: 10 };

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
  useMemo(() => processor.setupSimulation(update), [processor]);

  const [isSimple] = useState(true);

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
      ) : (
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
      )}
    </>
  );
}
