import React from "react";
import { RectComponent } from "./components";
import { HEIGHT, WIDTH } from "./constants";
import { Team, Region } from "./types";

interface UITournament {
  startX: number;
  width: number;
  teams: Team[];
  startY: number;
}

const tournaments: UITournament[] = [
  {
    startX: 30,
    width: 50,
    startY: 30,
    teams: [
      {
        name: "Team A",
        players: ["Player 1", "Player 2", "Player 3"],
        region: Region.NORTH_AMERICA,
      },
      {
        name: "Team B",
        players: ["Player 4", "Player 5", "Player 6"],
        region: Region.NORTH_AMERICA,
      },
    ],
  },
];

const PLAYER_HEIGHT = 10;

export default function VizComponent() {
  return (
    <svg height={HEIGHT} width={WIDTH}>
      {tournaments.map((t) => (
        <RectComponent
          x={t.startX}
          y={t.startY}
          width={t.width}
          height={t.teams.reduce((acc, cur) => {
            return acc + cur.players.length * PLAYER_HEIGHT;
          }, 0)}
        />
      ))}
    </svg>
  );
}
