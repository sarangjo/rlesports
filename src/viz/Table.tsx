import { find, forEach, get, indexOf, map, max, min, reduce, set, size } from "lodash";
import moment from "moment";
import React from "react";
import { WIDTH } from "../constants";
import { Player, Region, RlcsSeason } from "../types";
import { getTeamColor } from "../util";

const SEASON_WIDTH = 600;
const X_OFFSET = 150;
const Y_OFFSET = 50;
const PLAYER_HEIGHT = 25;

// Handle Season X gracefully
const getSeasonX = (s: string) => SEASON_WIDTH * (isNaN(parseInt(s, 10)) ? 9 : parseInt(s, 10) - 1);

const process = (seasons: RlcsSeason[], players: Player[]): ParticipationBlock[] => {
  const blocks: ParticipationBlock[] = [];
  const tournLength = {};
  forEach(seasons, (season) => {
    forEach(season.sections, (section, sectionIndex) => {
      forEach(section.tournaments, (tourney) => {
        const tourneyDone: Record<string, boolean> = {};
        forEach(tourney.teams, (team) => {
          forEach(team.players, (tname) => {
            // Find the event(s) relevant to this tournament by date
            let player = find(players, (p) => p.name.toLowerCase() === tname.toLowerCase());
            if (!player) {
              player = find(
                players,
                (p) => !!find(p.alternateIDs, (i) => i.toLowerCase() === tname.toLowerCase()),
              );
              if (!player) {
                console.log("Uh, didn't find a player... weird.", tname);
                return;
              }
            }

            if (player) {
              const name = player.name;
              forEach(player.memberships, (mem) => {
                // TODO how do we ensure people who form teams outside of RLCS but in the same timeframe
                // are *excluded*, but at the same time people who change teams but are not recognized on
                // LP are *included*? All signs seem to point to not using LP as the source of truth...
                // Depressing.
                //
                // Follow-up: Actually, not depressing. Here's what you do.
                // - Per tournament, go in order.
                // - If the team name doesn't match, see if this is the first one we're seeing for this tournament.
                //   - If it is, then this means the team name changed in the middle. So take it.
                //   - If it isn't, we're past the point of it being relevant for this tournament, so don't take it.
                if (
                  !tourneyDone[name] &&
                  mem.join <= tourney.end &&
                  (!mem.leave || mem.leave >= tourney.start)
                ) {
                  // The simple case. We have overlap. Create block
                  blocks.push({
                    player: name,
                    team: mem.team,
                    season: season.season,
                    region: tourney.region,
                    index: sectionIndex,
                    start: max([tourney.start, mem.join])!,
                    end: mem.leave ? min([tourney.end, mem.leave])! : tourney.end,
                  });
                  tourneyDone[name] = team.name === mem.team;
                }
              });
            }
          });
        });

        // Set tourney info
        // set(tournLength, `${season.season}[${sectionIndex}].${tourney.region}`, )
      });
    });
  });
  return blocks;
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
  seasons,
  players,
  teams,
}: {
  seasons: RlcsSeason[];
  players: Player[];
  teams: Record<string, string>;
}) {
  // Convert tournaments + player info into "participation blocks" which have some properties, that
  // will be then filtered on.
  const blocks = process(seasons, players);
  console.log(blocks);

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

  return (
    <svg height={Y_OFFSET + size(playerNames) * PLAYER_HEIGHT} width={WIDTH}>
    <g id="season-titles">
    {map(seasons, (s) => (
      <g id={`season-title-${s.season}`}>
      <rect x={X_OFFSET} y={0} width={SEASON_WIDTH} height={Y_OFFSET} fill="skyblue" />
      <text x={X_OFFSET} y={Y_OFFSET}>
      Season {s.season}
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
      const baseX = getSeasonX(b.season);
      const y = indexOf(playerNames, b.player) * PLAYER_HEIGHT;

      const section = find(
        get(
          find(seasons, (s) => s.season === b.season),
          "sections",
        ),
        (_sec, index) => index === b.index,
      );
      const tourney = find(
        get(
          section
          "tournaments",
        ),
        (t) => t.region === b.region,
      );

      let width, offsetX;
      if (!tourney) {
        width = 0;
        offsetX = 0;
      } else {
        const sec =
          offsetX = scaleTimeDisjoint(
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
