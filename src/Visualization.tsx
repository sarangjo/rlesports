import React from "react";
import { RectComponent, TextComponent } from "./components";
import { HEIGHT, WIDTH } from "./constants";
import { Team, Region } from "./types";
import { Tournament } from "./types";
import { TextOrientation } from "./types/svg";

const TEAM_HEIGHT = 400;

const tourneyUIDetails = [
  {
    x: 300,
    width: 500,
    y: 300,
  },
  {
    x: 1500,
    width: 500,
    y: 330,
  },
];

interface Link {
  from: { tournament: string; team: string };
  to: { tournament: string; team: string };
  players: string[];
}

interface UITournament extends Tournament {
  x: number;
  width: number;
  y: number;
  // height is TEAM_HEIGHT * teams.length
  teams: UITeam[];
}

interface UITeam extends Team {
  x: number;
  width: number;
  y: number;
  // height is TEAM_HEIGHT
}

interface UILink extends Link {
  fromX: number;
  fromTopY: number;
  fromBottomY: number;

  toX: number;
  toTopY: number;
  toBottomY: number;
}

const tournaments: Tournament[] = [
  {
    name: "Tournament I",
    start: "2023-01-01",
    end: "2023-01-08",
    region: Region.NORTH_AMERICA,
    teams: [
      {
        name: "Team A",
        players: ["Player 1", "Player 2", "Player 3"],
        region: Region.NORTH_AMERICA,
        color: "skyblue",
      },
      {
        name: "Team B",
        players: ["Player 4", "Player 5", "Player 6"],
        region: Region.NORTH_AMERICA,
        color: "orange",
      },
    ],
  },
  {
    name: "Tournament II",
    start: "2023-02-01",
    end: "2023-02-08",
    region: Region.NORTH_AMERICA,
    teams: [
      {
        name: "Team A",
        players: ["Player 1", "Player 2", "Player 4"],
        region: Region.NORTH_AMERICA,
        color: "skyblue",
      },
      {
        name: "Team B",
        players: ["Player 3", "Player 5", "Player 6"],
        region: Region.NORTH_AMERICA,
        color: "orange",
      },
    ],
  },
];

const links: Link[] = [
  {
    from: { tournament: "Tournament I", team: "Team A" },
    to: { tournament: "Tournament II", team: "Team A" },
    players: ["Player 1", "Player 2"],
  },
  {
    from: { tournament: "Tournament I", team: "Team A" },
    to: { tournament: "Tournament II", team: "Team B" },
    players: ["Player 3"],
  },
  {
    from: { tournament: "Tournament I", team: "Team B" },
    to: { tournament: "Tournament II", team: "Team A" },
    players: ["Player 4"],
  },
  {
    from: { tournament: "Tournament I", team: "Team B" },
    to: { tournament: "Tournament II", team: "Team B" },
    players: ["Player 5", "Player 6"],
  },
];

export default function VizComponent() {
  // Teams: update individual team nodes within the tournament, this is where links emanate to/from
  const uiTournaments = tournaments.map(
    (tournament, tournamentIndex) =>
      ({
        // Don't want to spread ...tournament because `teams` doesn't match
        name: tournament.name,
        start: tournament.start,
        end: tournament.end,
        region: tournament.region,

        x: tourneyUIDetails[tournamentIndex].x,
        width: tourneyUIDetails[tournamentIndex].width,
        y: tourneyUIDetails[tournamentIndex].y,

        teams: tournament.teams.map((team, teamIndex) => ({
          ...team,

          x: tourneyUIDetails[tournamentIndex].x,
          width: tourneyUIDetails[tournamentIndex].width,
          y: tourneyUIDetails[tournamentIndex].y + teamIndex * TEAM_HEIGHT,
        })),
      } as UITournament),
  );

  console.log(uiTournaments);

  // A link occupies a certain percentage of the team's height, which is fixed.
  // We use the link to find the appropriate uiTeam, and use that information to create a uiLink.

  // Note that the order matters as we fill up outgoing and incoming space for each team node.
  const inAndOut = tournaments.reduce((acc, cur) => {
    acc[cur.name] = cur.teams.reduce((acc2, cur2) => {
      acc2[cur2.name] = {
        in: 0,
        out: 0,
      };
      return acc2;
    }, {} as Record<string, { in: number; out: number }>);
    return acc;
  }, {} as Record<string, Record<string, { in: number; out: number }>>);

  const uiLinks = /*([] as Link[])*/ links.map((l) => {
    // First calculate the "out" side of the team, which maps to `from`
    const fromTeam = uiTournaments
      .find((t) => t.name === l.from.tournament)
      ?.teams?.find((t) => t.name === l.from.team);
    if (!fromTeam) {
      throw new Error("Could not find team for link: " + l);
    }
    const fromTeamInAndOut = inAndOut[l.from.tournament][l.from.team];

    const fromX = fromTeam.x + fromTeam.width;
    const fromTopY = fromTeam.y + (fromTeamInAndOut.out / fromTeam.players.length) * TEAM_HEIGHT;
    fromTeamInAndOut.out += l.players.length;
    const fromBottomY = fromTeam.y + (fromTeamInAndOut.out / fromTeam.players.length) * TEAM_HEIGHT;

    // Then calculate the "in" side of the team, which maps to `to`
    const toTeam = uiTournaments
      .find((t) => t.name === l.to.tournament)
      ?.teams?.find((t) => t.name === l.to.team);
    if (!toTeam) {
      throw new Error("Could not find team for link: " + l);
    }
    const toTeamInAndOut = inAndOut[l.to.tournament][l.to.team];
    const toX = toTeam.x;
    const toTopY = toTeam.y + (toTeamInAndOut.in / toTeam.players.length) * TEAM_HEIGHT;
    toTeamInAndOut.in += l.players.length;
    const toBottomY = toTeam.y + (toTeamInAndOut.in / toTeam.players.length) * TEAM_HEIGHT;

    return {
      ...l,
      fromX,
      fromTopY,
      fromBottomY,
      toX,
      toTopY,
      toBottomY,
    } as UILink;
  });

  return (
    <svg height={HEIGHT} width={WIDTH}>
      {uiTournaments.map((uit) => (
        <React.Fragment key={uit.name}>
          <RectComponent
            x={uit.x}
            y={uit.y}
            width={uit.width}
            height={TEAM_HEIGHT * uit.teams.length}
          />
          {uit.teams.map((uiTeam, i) => (
            <g key={i}>
              <RectComponent
                x={uiTeam.x}
                y={uiTeam.y}
                width={uiTeam.width}
                height={TEAM_HEIGHT}
                stroke="transparent"
                fill={uiTeam.color}
              >
                <title>{uiTeam.name}</title>
              </RectComponent>
              <TextComponent
                text={uiTeam.name}
                x={uiTeam.x}
                y={uiTeam.y + 20}
                orientation={TextOrientation.HORIZONTAL}
              />
            </g>
          ))}
        </React.Fragment>
      ))}
      {uiLinks.map((l) => (
        <polygon
          points={`${l.fromX},${l.fromTopY} ${l.toX},${l.toTopY} ${l.toX},${l.toBottomY} ${l.fromX},${l.fromBottomY}`}
          fill="none"
          stroke="black"
        />
      ))}
    </svg>
  );
}
