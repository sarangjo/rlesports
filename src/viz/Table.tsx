import React, { useMemo } from "react";
import { Player, Tournament } from "../types";
import { map, reduce, forEach, find, get, size } from "lodash";
import "./Table.css";
import { tournamentAcronym } from "../util";
import { HEIGHT, WIDTH } from "../constants";

const SEASON_WIDTH = 600;

interface Team {
  tournamentIndex: number;
  team: string;
}

const getAllPlayers = (tournaments: Tournament[]) =>
  reduce(
    tournaments,
    (acc, cur, tournamentIndex) => {
      forEach(cur.teams, (t) => {
        forEach(t.players, (p) => {
          const obj = { tournamentIndex, team: t.name };
          if (acc[p]) {
            acc[p].push(obj);
          } else {
            acc[p] = [obj];
          }
        });
      });
      return acc;
    },
    {} as Record<string, Team[]>,
  );

const getRow = (n: number, teams: Team[]) => {
  let idx = 0;
  const els = [];

  for (let i = 0; i < n; i++) {
    while (idx < teams.length && teams[idx].tournamentIndex < i) {
      idx++;
    }
    if (idx < teams.length && teams[idx].tournamentIndex === i) {
      els.push(<td className="table-team"> {teams[idx].team} </td>);
    } else {
      els.push(<td></td>);
    }
  }

  return els;
};

export default function Table({
  tournaments,
  players,
}: {
  tournaments: Tournament[];
  players: Player[];
}) {
  const allPlayers = useMemo(() => getAllPlayers(tournaments), [tournaments]);

  return (
    <svg height={HEIGHT} width={WIDTH}>
      <g transform="translate(40, 40)">
        <rect x={0} y={0} width={20} height={20} />
      </g>
    </svg>
  );

  /*
  return (
    <table>
      <tbody>
        <tr>
          <th>Player</th>
          {map(tournaments, (t) => (
            <th>{tournamentAcronym(t.name)}</th>
          ))}
        </tr>
        {map(allPlayers, (teams, p) => (
          <tr>
            <th>{p}</th>
            {getRow(size(tournaments), teams)}
          </tr>
        ))}
      </tbody>
    </table>
  );
  */
}
