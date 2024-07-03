import React from "react";
import { TEAM_HEIGHT, WIDTH } from "../constants";
import { UITeam, UITournament } from "./types";
import tournaments from "../data/tournaments.json";
import { colorNormalizer, getColorByBackground } from "../util/color";
import { Links } from "./links";
import { process } from "./processor";
import { tournamentShortName } from "../util/names";

function TeamComponent({ uiTeam }: { uiTeam: UITeam }) {
  return (
    <g>
      <rect
        x={uiTeam.x}
        y={uiTeam.y}
        width={uiTeam.width}
        height={TEAM_HEIGHT}
        stroke="black" //"transparent"
        fill={colorNormalizer(uiTeam.color)}
      >
        <title>
          {uiTeam.name}: {uiTeam.players.join(", ")}
        </title>
      </rect>
      <text
        x={uiTeam.x + uiTeam.width / 2}
        y={uiTeam.y + TEAM_HEIGHT / 2 /* + 20*/}
        fill={getColorByBackground(colorNormalizer(uiTeam.color))}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {uiTeam.name}
      </text>
    </g>
  );
}

function TournamentComponent({ uiTournament: uit }: { uiTournament: UITournament }) {
  return (
    <g name={uit.name}>
      <rect
        x={uit.x}
        y={uit.y}
        width={uit.width}
        height={TEAM_HEIGHT * uit.teams.length}
        stroke="black"
        fill="transparent"
      />
      {uit.teams.map((uiTeam, i) => (
        <TeamComponent key={i} uiTeam={uiTeam} />
      ))}
      <text
        x={uit.x + uit.width / 2}
        y={uit.y + uit.teams.length * TEAM_HEIGHT + 20}
        fill="black"
        textAnchor="middle"
      >
        {tournamentShortName(uit.name)}
      </text>
    </g>
  );
}

export default function Viz() {
  // Transform data into UI data objects. For teams: update individual team nodes within the
  // tournament, this is where links emanate to/from
  const [maxY, uiTournaments] = process(tournaments);

  console.log(uiTournaments);

  return (
    <svg height={maxY} width={WIDTH} style={{ margin: 20 }}>
      <Links uiTournaments={uiTournaments} />
      {uiTournaments.map((uit) => (
        <TournamentComponent uiTournament={uit} key={uit.name} />
      ))}
    </svg>
  );
}
