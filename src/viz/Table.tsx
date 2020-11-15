import { find, forEach, get, has, indexOf, keys, map, max, min, reduce, set, size } from "lodash";
import React from "react";
import { WIDTH } from "../constants";
import { Player, Region, RlcsSeason } from "../types";
import { getTeamColor, ScaleTimeDisjoint } from "../util";

const SEASON_WIDTH = 600;
const X_OFFSET = 150;
const Y_OFFSET = 50;
const PLAYER_HEIGHT = 25;

// Handle Season X gracefully
const getSeasonX = (s: string) => SEASON_WIDTH * (isNaN(parseInt(s, 10)) ? 9 : parseInt(s, 10) - 1);

const findPlayer = (players: Player[], tname: string) => {
  let player = find(players, (p) => p.name.toLowerCase() === tname.toLowerCase());
  if (!player) {
    player = find(
      players,
      (p) => !!find(p.alternateIDs, (i) => i.toLowerCase() === tname.toLowerCase()),
    );
    if (!player) {
      console.log("Uh, didn't find a player... weird.", tname);
      return null;
    }
  }
  return player;
};

// Design
// - For a given season, a player has to be strongly associated with a particular region. World region
//   subsumes all other regions.
// - We go tournament by tournament and append.
//   - [improvement] While appending, if the indices are adjacent and the previous block ends at the end, we can coalesce
const process = (seasons: RlcsSeason[], players: Player[]) =>
  map(seasons, (season) => {
    // Blocks are by season.
    const playerBlocks: Record<string, { region: Region; blocks: ParticipationBlock[] }> = {};

    forEach(season.sections, (section, sectionIndex) => {
      forEach(section.tournaments, (tourney) => {
        // tourneyDone is the logic used to figure out which teams the player was on before the
        // one specifically shown in the tournament, since that only shows the **last** team the
        // player was on. This is used to evaluate
        // whether we should keep adding events in the forEach loop below. It's quite heavily
        // broken if a player switches teams in the middle of a tournament. TODO fix.
        const tourneyDone: Record<string, boolean> = {};
        forEach(tourney.teams, (team) => {
          forEach(team.players, (tname) => {
            // Find the event(s) relevant to this tournament by date.
            const player = findPlayer(players, tname);

            if (player) {
              const name = player.name;
              forEach(player.memberships, (mem) => {
                if (
                  !tourneyDone[name] &&
                  mem.join <= tourney.end &&
                  (!mem.leave || mem.leave >= tourney.start)
                ) {
                  if (!has(playerBlocks, name)) {
                    playerBlocks[name] = {
                      region: team.region,
                      blocks: [],
                    };
                  }

                  // The simple case. We have overlap. Create block
                  playerBlocks[name].blocks.push({
                    team: mem.team,
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
      });
    });

    return playerBlocks;
  });

// TODO LAN

interface ParticipationBlock {
  // player: string;
  team: string;
  // TODO Remove all following
  // season: string;
  // region: Region;
  index: number;
  // dates (TODO remove)
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
  const seasonsData = process(seasons, players);
  console.log(seasonsData);

  // TODO who needs this when it's already the keys of various maps
  const playerNames = Array.from<string>(
    reduce(
      seasonsData,
      (acc, cur) => {
        forEach(keys(cur), (p) => acc.add(p));
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
        {map(seasonsData, (data, sIndex) => {
          // Convert each player's blocks into reality.
          const season = seasons[sIndex];
          const baseX = getSeasonX(season.season);

          return (
            <g id={`block-space-season-${season.season}`}>
              {map(data, (playerData, pname) => {
                // This represents which region pname is competing in for this season. NOTE: No mid-season region transfers
                // TODO put all assumptions in a central place somewhere so we know where to look if something breaks

                // TODO all of this logic up till `scale` is just `season`+`region` based
                const region = playerData.region;

                // Get date offsets
                const dates: Array<[string, string]> = [];
                forEach(season.sections, (sec) => {
                  // Find the relevant dates for this sec. Based on region.
                  const relevantTourney =
                    find(sec.tournaments, (t) => t.region === region) ||
                    find(sec.tournaments, (t) => t.region === Region.WORLD);

                  if (!relevantTourney) {
                    console.error("No tourney found for this region. Rip.");
                  } else {
                    dates.push([relevantTourney.start, relevantTourney.end]);
                  }
                });

                const scale = new ScaleTimeDisjoint(dates, [baseX, SEASON_WIDTH]);

                return (
                  <g id={`block-space-season-${seasons[sIndex].season}-player-${pname}`}>
                    {map(playerData.blocks, (b) => {
                      const y = indexOf(playerNames, pname) * PLAYER_HEIGHT;

                      const startX = scale.convert(b.start);
                      const endX = scale.convert(b.end);

                      return (
                        <g>
                          <rect
                            x={baseX + startX}
                            y={y}
                            width={endX - startX}
                            height={PLAYER_HEIGHT}
                            fill={getTeamColor(b.team, teams)}
                            opacity={0.7}
                          />
                          <text x={baseX + startX} y={y + PLAYER_HEIGHT}>
                            {b.team}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
