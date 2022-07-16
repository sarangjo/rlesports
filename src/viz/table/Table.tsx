import { differenceInDays } from "date-fns";
import { s2d } from "../../util/datetime";
import {
  assign,
  find,
  forEach,
  has,
  indexOf,
  keys,
  last,
  map,
  max,
  min,
  reduce,
  size,
  some,
} from "lodash";
import React from "react";
import { Player, Region, RlcsSeason } from "../../types";
import { getColorByBackground, getTeamColor } from "../../util/colors";

// TODO add an option so we evenly space out each section instead of scaling by the length of each
// disjoint time block
class ScaleTimeDisjoint {
  public dateDiffs: number[];
  public totalDiff: number = 0;
  public domain: Array<[string, string]>;
  public range: [number, number];

  // domain needs to be increasing order, each element needs to be 0 < 1
  constructor(domain: Array<[string, string]>, range: [number, number]) {
    // Calculate the date ranges involved in each
    this.dateDiffs = map(domain, (r) => {
      // Add 1 because we're calculating the length of the tournament in days.
      const diff = differenceInDays(s2d(r[1]), s2d(r[0])); // + 1
      this.totalDiff += diff;
      return diff;
    });
    this.domain = domain;
    this.range = range;
  }

  public convert(input: string) {
    let output = this.range[0];

    // Find the date range index that we live in
    some(this.domain, (r, i) => {
      const totalX = (this.dateDiffs[i] / this.totalDiff) * (this.range[1] - this.range[0]);
      if (r[0] <= input && input <= r[1]) {
        // Add our local diff
        const localDiff = differenceInDays(s2d(input), s2d(r[0]));
        output += (localDiff / this.dateDiffs[i]) * totalX;
        return true;
      }
      output += totalX;
    });

    return output;
  }
}

const SEASON_WIDTH = 600;
const X_OFFSET = 150;
const Y_OFFSET = 50;
const PLAYER_HEIGHT = 25;
const PADDING = 4;
const TEXT_OFFSET_X = 4;
const TEXT_OFFSET_Y = 6;

const BIG_HEIGHT = 3000;

interface ExtendedPlayer extends Player {
  alternateIDs?: string[];
}

// Get player by name or by alternate ID
const findPlayer = (players: ExtendedPlayer[], tname: string) => {
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

// Handle Season X gracefully
const getSeasonX = (s: string) => SEASON_WIDTH * (isNaN(parseInt(s, 10)) ? 9 : parseInt(s, 10) - 1);

// Design
// - For a given season, a player has to be strongly associated with a particular region. World region
//   subsumes all other regions.
// - We go tournament by tournament and append.
//   - While appending, if the indices are adjacent and the previous block ends at the end, we can coalesce
const process = (seasons: RlcsSeason[], players: Player[]) =>
  map(seasons, (season) => {
    // Blocks are by season.
    const playerBlocks: Record<string, { blocks: ParticipationBlock[]; region: Region }> = {};

    forEach(season.sections, (section) => {
      forEach(section.tournaments, (tourney) => {
        const tourneyDone: Record<string, boolean> = {};

        // TODO implement
        // The blocks for this tournament are governed by the same rules as filterByTournament in
        // players.go.
        // Build up a map from player to list of blocks, with the last team match
        // const tournamentBlocks: Record<
        //   string,
        //   { blocks: ParticipationBlock[]; lastTeamMatch: number }
        // > = {};

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

                  const { blocks } = playerBlocks[name];
                  // The simple case. We have overlap. Create block
                  const start = max([tourney.start, mem.join])!;
                  const fullStart = mem.join <= tourney.start;
                  const end = mem.leave ? min([tourney.end, mem.leave])! : tourney.end;
                  const fullEnd = !mem.leave || mem.leave >= tourney.end;

                  // Try coalescing with last block. We can coalesce if the start of this and end of
                  // previous line up.
                  if (
                    size(blocks) > 0 &&
                    last(blocks)!.fullEnd &&
                    fullStart &&
                    last(blocks)!.team === mem.team
                  ) {
                    assign(last(blocks), {
                      end,
                      fullEnd,
                    });
                  } else {
                    blocks.push({
                      team: mem.team,
                      start,
                      end,
                      fullStart,
                      fullEnd,
                    });
                  }
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
  // extend
  fullStart: boolean;
  fullEnd: boolean;
  // dates (TODO remove)
  start: string;
  end: string;
}

export default function Table({
  seasons,
  players,
  teamColors,
}: {
  seasons: RlcsSeason[];
  players: Player[];
  teamColors: Record<string, string>;
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
    <svg height={BIG_HEIGHT} width={SEASON_WIDTH * size(seasonsData) + X_OFFSET}>
      <g id="seasons">
        {map(seasons, (s, i) => (
          <>
            <g id={`season-title-${s.season}`}>
              <rect
                x={X_OFFSET + SEASON_WIDTH * i}
                y={0}
                width={SEASON_WIDTH}
                height={Y_OFFSET}
                fill="skyblue"
              />
              <text x={X_OFFSET + SEASON_WIDTH * i + TEXT_OFFSET_X} y={Y_OFFSET - TEXT_OFFSET_Y}>
                Season {s.season}
              </text>
            </g>
            <g id={`season-lines-${s.season}`}>
              {[i, i + 1].map((j) => (
                <line
                  stroke="black"
                  x1={X_OFFSET + SEASON_WIDTH * j}
                  y1={0}
                  x2={X_OFFSET + SEASON_WIDTH * j}
                  y2={BIG_HEIGHT}
                />
              ))}
            </g>
          </>
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
            <text x={TEXT_OFFSET_X} y={Y_OFFSET + (idx + 1) * PLAYER_HEIGHT - TEXT_OFFSET_Y}>
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

                const scale = new ScaleTimeDisjoint(dates, [0, SEASON_WIDTH]);

                return (
                  <g id={`block-space-season-${seasons[sIndex].season}-player-${pname}`}>
                    {map(playerData.blocks, (b) => {
                      // TODO include alternate ID's here
                      const y = indexOf(playerNames, pname) * PLAYER_HEIGHT;

                      const startX = scale.convert(b.start);
                      const endX = scale.convert(b.end);

                      const color = getTeamColor(b.team, teamColors);

                      return (
                        <g>
                          <rect
                            x={baseX + startX + PADDING / 2}
                            y={y + PADDING / 2}
                            width={endX - startX - PADDING}
                            height={PLAYER_HEIGHT - PADDING}
                            fill={color}
                            opacity={0.7}
                          />
                          <text
                            x={baseX + startX + TEXT_OFFSET_X}
                            y={y + PLAYER_HEIGHT - TEXT_OFFSET_Y}
                            fill={getColorByBackground(color)}
                          >
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
