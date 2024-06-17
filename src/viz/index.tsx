import React from "react";
import { HEIGHT, TEAM_HEIGHT, WIDTH } from "../constants";
import { UITeam, UITournament } from "./types";
import { tournaments } from "../data/rlcs1";
import { scaleTime } from "d3-scale";
import { s2d } from "../util/datetime";
import { colorNormalizer, getColorByBackground } from "../util/color";
import { Links } from "./links";
import { yProcess } from "./yProcessor";

function Team({ uiTeam }: { uiTeam: UITeam }) {
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

function Tournament({ uiTournament: uit }: { uiTournament: UITournament }) {
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
        <Team key={i} uiTeam={uiTeam} />
      ))}
      <text
        x={uit.x + uit.width / 2}
        y={uit.y + uit.teams.length * TEAM_HEIGHT + 20}
        fill="black"
        textAnchor="middle"
      >
        {uit.name}
      </text>
    </g>
  );
}

export default function Viz() {
  const x = scaleTime()
    .domain([s2d(tournaments[0].start), s2d(tournaments[tournaments.length - 1].end)])
    .range([0, WIDTH]);

  // Transform data into UI data objects. For teams: update individual team nodes within the
  // tournament, this is where links emanate to/from
  const uiTournaments = yProcess(
    tournaments.map(
      (tournament) =>
        ({
          // Don't want to spread ...tournament because `teams` doesn't match
          name: tournament.name,
          start: tournament.start,
          end: tournament.end,
          region: tournament.region,

          // UI elements
          x: x(s2d(tournament.start)),
          width: x(s2d(tournament.end)) - x(s2d(tournament.start)),
          y: 0,

          teams: tournament.teams.map((team, teamIndex) => ({
            ...team,

            x: x(s2d(tournament.start)),
            width: x(s2d(tournament.end)) - x(s2d(tournament.start)),
            y: teamIndex * TEAM_HEIGHT,
          })),
        } as UITournament),
    ),
  );

  return (
    <svg height={HEIGHT} width={WIDTH} style={{ margin: 20 }}>
      <Links uiTournaments={uiTournaments} />
      {uiTournaments.map((uit) => (
        <Tournament uiTournament={uit} key={uit.name} />
      ))}
    </svg>
  );
}
