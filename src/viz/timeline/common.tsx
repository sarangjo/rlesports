import React from "react";
import { TextComponent, ConnectorComponent, CircleComponent } from "../../components";
import { UIPlayer } from "./types";

export function PlayerComponent({ player }: { player: UIPlayer }) {
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
