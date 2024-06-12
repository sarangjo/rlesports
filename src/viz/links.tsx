import FastSet from "collections/fast-set";
import React from "react";
import { tournamentsToLinks } from "../data";
import { colorNormalizer } from "../util/color";
import { tournaments } from "../data/rlcs1";
import { UITournament, Gradient, UILink } from "./types";
import { TEAM_HEIGHT } from "../constants";

const gradientId = (gradient: Gradient) => {
  return `${colorNormalizer(gradient.from)}-${colorNormalizer(gradient.to)}`.replaceAll("#", "");
};

// Given a list of Tournament UI objects, generates links connecting the same player across tournaments
export function Links({ uiTournaments }: { uiTournaments: UITournament[] }) {
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

  const gradients = new FastSet([], (a: Gradient, b: Gradient) => {
    a.from === b.from && a.to === b.to;
  });

  const links = tournamentsToLinks(uiTournaments);

  const uiLinks = links.map((l) => {
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

    // Color evaluation
    let fill: string | undefined;
    if (fromTeam.color === toTeam.color) {
      fill = fromTeam.color;
    } else {
      // Create a gradient
      const gradient: Gradient = { from: fromTeam.color, to: toTeam.color };
      gradients.add(gradient);
      fill = `url(#${gradientId(gradient)})`;
    }

    return {
      ...l,
      fromX,
      fromTopY,
      fromBottomY,
      toX,
      toTopY,
      toBottomY,
      fill,
    } as UILink;
  });

  return (
    <g id="links">
      <defs>
        {gradients.map((g: Gradient) => (
          <linearGradient id={gradientId(g)} key={gradientId(g)}>
            <stop offset="0%" stopColor={colorNormalizer(g.from)} />
            <stop offset="100%" stopColor={colorNormalizer(g.to)} />
          </linearGradient>
        ))}
      </defs>
      {uiLinks.map((l) => (
        <Link key={l.players.join("-")} uiLink={l} />
      ))}
    </g>
  );
}

function Link({ uiLink: l }: { uiLink: UILink }) {
  return (
    <polygon
      points={`${l.fromX},${l.fromTopY} ${l.toX},${l.toTopY} ${l.toX},${l.toBottomY} ${l.fromX},${l.fromBottomY}`}
      fill={colorNormalizer(l.fill)}
      stroke="black"
    >
      <title>{l.players.join(", ")}</title>
    </polygon>
  );
}
