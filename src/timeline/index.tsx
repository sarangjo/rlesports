import React from "react";
import { CircleComponent, ConnectorComponent, TextComponent } from "../components";
import { Player } from "../types";
import { UIRectangle } from "../types/ui";
import { DataProcessor } from "./data";
import { UIPlayer } from "./types";

const LEFT_MARGIN = 75;
const TOP_MARGIN = 100;

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
    x: LEFT_MARGIN,
    y: TOP_MARGIN,
    width: width - LEFT_MARGIN,
    height: height - TOP_MARGIN,
  };

  // Players
  const processor = new DataProcessor(players, teamColors, bounds);
  const { players: uiPlayers, dates } = processor.process();

  return (
    <>
      <g id="dates">
        {dates.map((d) => (
          <TextComponent {...d} />
        ))}
      </g>
      <g id="players">
        {uiPlayers.map((p) => (
          <PlayerComponent player={p} />
        ))}
      </g>
    </>
  );
}
