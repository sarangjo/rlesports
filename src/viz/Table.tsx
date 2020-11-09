import { find, forEach, get, has, indexOf, map, max, min, reduce, set, size } from "lodash";
import moment from "moment";
import React from "react";
import { HEIGHT, WIDTH } from "../constants";
import { Player, Region, Tournament } from "../types";
import { getTeamColor } from "../util";
import "./Table.css";

const SEASON_WIDTH = 600;
const X_OFFSET = 150;
const Y_OFFSET = 50;
const PLAYER_HEIGHT = 25;

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

// Handle Season X gracefully
const getSeasonX = (s: string) => SEASON_WIDTH * (isNaN(parseInt(s, 10)) ? 9 : parseInt(s, 10) - 1);

type SectionLengthMap = Record<string, Record<number, Record<number, number>>>;

const process = (
  tournaments: Tournament[],
  players: Player[],
): [ParticipationBlock[], Record<string, number>, SectionLengthMap] => {
  const blocks: ParticipationBlock[] = [];
  const numSections: Record<string, number> = {};
  const sectionLengths: SectionLengthMap = {};
  forEach(tournaments, (t) => {
    forEach(t.teams, (team) => {
      forEach(team.players, (player) => {
        // Find the event(s) relevant to this tournament by date
        const playerDetails = find(players, (p) => p.name === player);
        if (!playerDetails) {
          console.log("Uh, didn't find a player... weird.", player);
          return;
        }
        forEach(playerDetails.memberships, (mem) => {
          // TODO how do we ensure people who form teams outside of RLCS but in the same timeframe
          // are *excluded*, but at the same time people who change teams but are not recognized on
          // LP are *included*? All signs seem to point to not using LP as the source of truth...
          // Depressing.
          if (mem.join <= t.end && (!mem.leave || mem.leave >= t.start) && team.name === mem.team) {
            // We have overlap. Create block
            blocks.push({
              player,
              team: mem.team,
              season: t.season,
              region: t.region,
              index: t.index,
              start: max([t.start, mem.join])!,
              end: mem.leave ? min([t.end, mem.leave])! : t.end,
            });
          }
        });
      });
    });

    if (has(numSections, t.season)) {
      numSections[t.season] =
        numSections[t.season] > t.index + 1 ? numSections[t.season] : t.index + 1;
    } else {
      numSections[t.season] = t.index + 1;
    }
  });
  return [blocks, numSections, sectionLengths];
};

// TODO LAN

interface ParticipationBlock {
  player: string;
  team: string;
  season: string;
  region: Region;
  index: number;
  // dates
  start: string;
  end: string;
}

export default function Table({
  tournaments,
  players,
  teams,
}: {
  tournaments: Tournament[];
  players: Player[];
  teams: Record<string, string>;
}) {
  // Convert tournaments + player info into "participation blocks" which have some properties, that
  // will be then filtered on.
  const [blocks, numSections] = process(tournaments, players);
  console.log(blocks, numSections);

  // Based on which participation blocks get selected, certain columns and rows will be shown.
  const playerNames = Array.from<string>(
    reduce(
      blocks,
      (acc, cur) => {
        acc.add(cur.player);
        return acc;
      },
      new Set(),
    ),
  );

  const seasons = ["1"];

  return (
    <svg height={Y_OFFSET + size(playerNames) * PLAYER_HEIGHT} width={WIDTH}>
      <g id="season-titles">
        {map(seasons, (s) => (
          <g id={`season-title-${s}`}>
            <rect x={X_OFFSET} y={0} width={SEASON_WIDTH} height={Y_OFFSET} fill="skyblue" />
            <text x={X_OFFSET} y={Y_OFFSET}>
              Season {s}
            </text>
          </g>
        ))}
      </g>
      <g id="player-names">
        {map(playerNames, (name, idx) => (
          <g id={`player-name-${name}`}>
            <rect
              x={0}
              y={Y_OFFSET + idx * PLAYER_HEIGHT}
              width={X_OFFSET}
              height={PLAYER_HEIGHT}
              fill="transparent"
              stroke="black"
              strokeWidth={1}
            />
            <text x={0} y={Y_OFFSET + (idx + 1) * PLAYER_HEIGHT}>
              {name}
            </text>
          </g>
        ))}
      </g>
      <g transform={`translate(${X_OFFSET},${Y_OFFSET})`} id="block-space">
        {map(blocks, (b) => {
          const sectionWidth = SEASON_WIDTH / numSections[b.season];
          const baseX = getSeasonX(b.season) + b.index * sectionWidth;
          const y = indexOf(playerNames, b.player) * PLAYER_HEIGHT;

          const tourney = find(
            tournaments,
            (t) => t.season === b.season && t.region === b.region && t.index === b.index,
          );
          let width, offsetX;
          if (!tourney) {
            width = 0;
            offsetX = 0;
          } else {
            const fullLength = moment(tourney.end).diff(tourney.start, "d");
            const length = moment(b.end).diff(b.start, "d");
            const offset = moment(b.start).diff(tourney.start, "d");

            width = (length / fullLength) * sectionWidth;
            offsetX = (offset / fullLength) * sectionWidth;
          }

          return (
            <g>
              <rect
                x={baseX + offsetX}
                y={y}
                width={width}
                height={PLAYER_HEIGHT}
                fill={getTeamColor(b.team, teams)}
                opacity={0.7}
              />
              <text x={baseX + offsetX} y={y + PLAYER_HEIGHT}>
                {b.team}
              </text>
            </g>
          );
        })}
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
