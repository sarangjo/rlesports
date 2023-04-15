import React from "react";
import { RectComponent } from "./components";
import { HEIGHT, WIDTH } from "./constants";
import { Team, Region } from "./types";

const TEAM_HEIGHT = 40;

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
        color: "blue",
      },
      {
        name: "Team B",
        players: ["Player 4", "Player 5", "Player 6"],
        region: Region.NORTH_AMERICA,
        color: "orange",
      },
    ],
  },
];

export default function VizComponent() {
  return (
    <svg height={HEIGHT} width={WIDTH}>
      {tournaments.map((t) => (
        <>
          <RectComponent
            x={t.startX}
            y={t.startY}
            width={t.width}
            height={TEAM_HEIGHT * t.teams.length}
          />
          {t.teams.map((team, i) => (
            <RectComponent
              x={t.startX}
              y={t.startY + i * TEAM_HEIGHT}
              width={t.width}
              height={TEAM_HEIGHT}
              stroke="transparent"
              fill={team.color}
            >
              <title>{team.name}</title>
            </RectComponent>
          ))}
        </>
      ))}
    </svg>
  );
}
