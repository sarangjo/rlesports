import React from "react";
import { HEIGHT, TEAM_HEIGHT, WIDTH } from "../constants";
import { UITeam, UITournament } from "./types";
import { tournaments } from "./rlcs1na";
import { scaleTime } from "d3-scale";
import { s2d } from "../util/datetime";
import { colorNormalizer, getColorByBackground } from "../util/color";
import { yProcess } from "./yProcessor";
import { Links } from "./links";

/*
const tourneyUIDetails = [
  {
    // x: 100,
    // width: 500,
    y: 100,
  },
  {
    // x: 1500,
    // width: 500,
    y: 160,
  },
];
*/

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
        <title>{uiTeam.name}</title>
      </rect>
      <text
        x={uiTeam.x}
        y={uiTeam.y + 20}
        fill={getColorByBackground(colorNormalizer(uiTeam.color))}
      >
        {uiTeam.name}
      </text>
    </g>
  );
}

function Tournament({ uiTournament: uit }: { uiTournament: UITournament }) {
  return (
    <g id={`tournament-${uit.name}`} key={uit.name}>
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
    </g>
  );
}

export default function Viz() {
  const x = scaleTime()
    .domain([s2d(tournaments[0].start), s2d(tournaments[1].end)])
    .range([0, WIDTH]);

  // Teams: update individual team nodes within the tournament, this is where links emanate to/from
  const uiTournaments = tournaments.map(
    (tournament, tournamentIndex) =>
      ({
        // Don't want to spread ...tournament because `teams` doesn't match
        name: tournament.name,
        start: tournament.start,
        end: tournament.end,
        region: tournament.region,

        x: x(s2d(tournament.start)),
        width: x(s2d(tournament.end)) - x(s2d(tournament.start)),
        // y: tourneyUIDetails[tournamentIndex].y,

        teams: tournament.teams.map((team, teamIndex) => ({
          ...team,

          x: x(s2d(tournament.start)),
          width: x(s2d(tournament.end)) - x(s2d(tournament.start)),
          // y: tourneyUIDetails[tournamentIndex].y + teamIndex * TEAM_HEIGHT,
        })),
      } as UITournament),
  );

  yProcess(uiTournaments);

  return (
    <svg height={HEIGHT} width={WIDTH}>
      <Links uiTournaments={uiTournaments} />
      {uiTournaments.map((uit) => (
        <Tournament uiTournament={uit} />
      ))}
    </svg>
  );
}