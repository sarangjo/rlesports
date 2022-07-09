import React from "react";
import {
  CircleComponent,
  ConnectorComponent,
  LineComponent,
  RectComponent,
  TextComponent,
} from "../components";
import { Player } from "../types";
import { UIRectangle } from "../types/ui";
import { DataProcessor } from "./data";
import { UIPlayer } from "./types";

const MARGIN = { left: 75, top: 100, right: 10, bottom: 10 };

function PlayerComponent({ player }: { player: UIPlayer }) {
  return (
    <>
      {player.name && <TextComponent {...player.name} />}
      {player.memberships.map((s, i) => (
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
  const bounds: UIRectangle = {
    x: MARGIN.left,
    y: MARGIN.top,
    width: width - MARGIN.left - MARGIN.right,
    height: height - MARGIN.top - MARGIN.bottom,
  };

  // Players
  const processor = new DataProcessor(players, teamColors, bounds);
  const { players: uiPlayers, dates } = processor.process();

  console.log(dates);

  return (
    <>
      <g id="dates">
        {dates.map(([d, l]) => (
          <>
            <TextComponent {...d} />
            <LineComponent {...l} />
          </>
        ))}
      </g>
      <g id="players">
        {uiPlayers.map((p) => (
          <PlayerComponent player={p} />
        ))}
      </g>
      <RectComponent {...bounds} />
    </>
  );
}
