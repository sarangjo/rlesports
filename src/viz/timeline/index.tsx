import React, { useMemo } from "react";
import { useUpdate } from "react-use";
import {
  CircleComponent,
  ConnectorComponent,
  LineComponent,
  RectComponent,
  TextComponent,
} from "../../components";
import { Player } from "../../types";
import { UIRectangle } from "../../types/ui";
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

  // Players
  const processor = useMemo(() => {
    console.log("memo 1");
    return new DataProcessor(players, teamColors, bounds);
  }, [players, teamColors]);

  const dates = useMemo(() => {
    console.log("memo 2");
    return processor.getDates();
  }, [processor]);

  useMemo(() => {
    console.log("memo 3");
    processor.setupSimulation(update);
  }, [processor]);

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
      {false && (
        <g id="players">
          {processor.getSimplePlayers().map((p, i) => (
            <PlayerComponent player={p} key={i} />
          ))}
        </g>
      )}
      {true && (
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
            {processor.getSimLinks().map((c) => (
              <ConnectorComponent {...c} />
            ))}
          </g>
        </>
      )}
    </>
  );
}
