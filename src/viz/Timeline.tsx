import { scaleTime } from "d3-scale";
import {
  concat,
  find,
  forEach,
  isNull,
  isUndefined,
  last,
  map,
  maxBy,
  minBy,
  range,
  reduce,
  size,
} from "lodash";
import moment, { Moment } from "moment";
import React from "react";
import { CIRCLE_RADIUS, MARGIN, SPACING } from "../constants";
import { EventType, Player, RlcsSeason } from "../types";
import {
  DATE_FORMAT,
  findPlayer,
  getTeamColor,
  toDate,
  tournamentAcronym,
  tournamentMap,
} from "../util";

const BIG_WIDTH = 5500;
// const BIG_HEIGHT = 2500;

const TIMELINE_BUFFER = 10;

const Radius = {
  [EventType.JOIN]: 4,
  [EventType.LEAVE]: 6,
};
const FILL_LEAVE = "transparent";
const COLOR_NO_TEAM = "#bbbbbb";
const STROKE_WIDTH_TEAM = 3;

// Three inputs:
// - player events: join/leave team
//    - teams are evaluated based on the ones that participated in the tournaments
// - team info: colors, date range
// - tournaments: participants (team names could change), winners

const getIndices = (players: Player[]): Record<string, number> => {
  let idx = 0;
  return reduce(
    players,
    (acc, p) => {
      const myIndex = idx++;
      if (p.name in acc) {
        console.error("ERROR ERROR DUPLICATE PLAYER!", p);
      } else {
        acc[p.name] = myIndex;
        forEach(p.alternateIDs, (name) => {
          if (name in acc) {
            console.error("ERROR ERROR DUPLICATE PLAYER!", p);
          } else {
            acc[name] = myIndex;
          }
        });
      }
      return acc;
    },
    {} as Record<string, number>,
  );
};

// Contract: each player's events are always sorted in time order. Tournaments are sorted.
export default function Timeline({
  seasons,
  players,
  teams,
}: {
  seasons: RlcsSeason[];
  players: Player[];
  teams: Record<string, string>;
}) {
  if (size(seasons) === 0) {
    return <div>Loading...</div>;
  }

  const indices = getIndices(players);

  // Most important function: given an event # and player, get its Y coordinate.
  const getY = (player: string, _eventNum?: number, _eventType?: EventType) => {
    let index;
    if (!(player in indices)) {
      // index = find(indices, (_x, name) => name.toLowerCase() === player.toLowerCase());
      // if (isUndefined(index)) {
      return null;
      //   }
    } else {
      index = indices[player];
    }

    return 10 * SPACING + index * 2 * SPACING;
  };

  // Calculating minimum and maximum:
  // [min/max] Try 1: events
  const start = minBy(players, (p) => p.memberships[0].join);
  const end = maxBy(players, (p) => last(p.memberships)!.leave || last(p.memberships)!.join);

  if (!start || !end) {
    return (
      <b>
        Somethin's wrong! start {JSON.stringify(start)} or end {JSON.stringify(end)} are undefined
      </b>
    );
  }

  const startDate = start.memberships[0].join;
  const endDate = last(end.memberships)!.leave || last(end.memberships)!.join;

  // [min/max] Try 2: tournaments
  // startDate = startDate > tournaments[0].start ? tournaments[0].start : startDate;
  // endDate = endDate < last(tournaments)!.end ? last(tournaments)!.end : endDate;

  const x = scaleTime()
    .domain([toDate(startDate), toDate(endDate)])
    .range([MARGIN * 3, BIG_WIDTH - MARGIN]);

  const TimelineDate = ({ now }: { now: Moment }) => (
    <text
      x={x(now.toDate())}
      y={CIRCLE_RADIUS}
      transform={`rotate(90,${x(now.toDate())},${CIRCLE_RADIUS})`}
      // textLength={(d.y1 || 0) - (d.y0 || 0)}
      // lengthAdjust="spacing"
    >
      {now.format(DATE_FORMAT)}
    </text>
  );

  const bigHeight = TIMELINE_BUFFER + size(players) * CIRCLE_RADIUS * 2.5;

  return (
    <svg width={BIG_WIDTH} height={bigHeight}>
      <g id="tournaments">
        {tournamentMap(seasons, (t) => {
          const thisX = x(toDate(t.start));
          const thisWidth = x(toDate(t.end)) - x(toDate(t.start));

          return (
            <g>
              <rect x={thisX} y={0} width={thisWidth} height={bigHeight} opacity={0.2} />
              <text
                x={thisX + thisWidth / 2}
                y={TIMELINE_BUFFER * CIRCLE_RADIUS}
                transform={`rotate(90,${thisX + thisWidth / 2},${TIMELINE_BUFFER * CIRCLE_RADIUS})`}
                // textLength={BIG_HEIGHT - TIMELINE_BUFFER * CIRCLE_RADIUS}
                // lengthAdjust="spacing"
              >
                {tournamentAcronym(t.name)}
              </text>
              {reduce(
                t.teams,
                (acc3, team) => {
                  return concat(
                    acc3,
                    map(team.players, (p) => {
                      const myY = getY(p);
                      if (isNull(myY)) {
                        console.error("couldn't find player", p);
                        return undefined;
                      }

                      // Sanity check
                      const player = findPlayer(players, p);
                      if (player) {
                        const memb = find(
                          player.memberships,
                          (m) => m.join <= t.end && (!m.leave || m.leave >= t.start),
                        );
                        if (!memb) {
                          console.error(
                            "couldn't find membership for",
                            p,
                            "for tournament",
                            t.name,
                            "and team",
                            team.name,
                          );
                        }
                      } else {
                        console.error("couldn't find player, but found Y... weird", p);
                      }

                      return (
                        <rect
                          x={thisX}
                          y={myY - CIRCLE_RADIUS / 2 - STROKE_WIDTH_TEAM / 2}
                          width={thisWidth}
                          height={CIRCLE_RADIUS + STROKE_WIDTH_TEAM}
                          opacity={0.3}
                          fill="maroon"
                        >
                          <title>
                            {p} * {team.name}
                          </title>
                        </rect>
                      );
                    }),
                  );
                },
                [] as any[],
              )}
            </g>
          );
        })}
      </g>
      <g id="timeline">
        {map(range(0, moment(endDate).diff(startDate, "d"), 50), (days, i) => (
          <TimelineDate key={i} now={moment(startDate).add(days, "d")} />
        ))}
        {tournamentMap(seasons, (t) => (
          <>
            <TimelineDate now={moment(t.start)} />
            <TimelineDate now={moment(t.end)} />
          </>
        ))}
      </g>
      <g id="events">
        {map(players, (player) => {
          // TODO filter out players that don't have tournaments visible in the view rn
          // Processing a single player's events, we can produce the nodes and links in one iteration
          const elements = reduce(
            player.memberships,
            (acc, mem, idx) => {
              const color = getTeamColor(mem.team, teams);

              // Join
              const joinX = x(toDate(mem.join));
              const joinY = getY(player.name, idx, EventType.JOIN)!;
              const circ = (
                <circle
                  id={`${player.name}-join-${mem.team}`}
                  data-date={mem.join}
                  cx={joinX}
                  cy={joinY}
                  r={Radius[EventType.JOIN]}
                  stroke={color}
                  fill={color}
                />
              );
              acc.push(
                idx === 0 ? (
                  <g>
                    {circ}
                    <text textAnchor="end" x={joinX - SPACING} y={joinY + SPACING / 2}>
                      {player.name}
                    </text>
                  </g>
                ) : (
                  circ
                ),
              );

              // Link backward between events
              if (idx !== 0) {
                const prevLeaveX = x(toDate(player.memberships[idx - 1].leave!));
                const prevLeaveY = getY(player.name, idx, EventType.LEAVE)!;

                acc.push(
                  <line
                    id={`${player.name}-teamless-${idx}`}
                    x1={prevLeaveX}
                    y1={prevLeaveY}
                    x2={joinX}
                    y2={joinY}
                    stroke={COLOR_NO_TEAM}
                  />,
                );
              }

              // Leave?
              const leaveX = x(toDate(mem.leave || endDate));
              const leaveY = getY(player.name, idx, EventType.LEAVE)!;
              if (mem.leave) {
                acc.push(
                  <circle
                    id={`${player.name}-leave-${mem.team}`}
                    data-date={mem.leave}
                    cx={leaveX}
                    cy={leaveY}
                    r={Radius[EventType.LEAVE]}
                    stroke={color}
                    fill={FILL_LEAVE}
                  />,
                );
              }

              acc.push(
                <line
                  id={`${player.name}-team-${mem.team}`}
                  x1={joinX}
                  y1={joinY}
                  x2={leaveX}
                  y2={leaveY}
                  stroke={color}
                  strokeWidth={STROKE_WIDTH_TEAM}
                >
                  <title>
                    {player.name} | {mem.team}
                  </title>
                </line>,
              );

              return acc;
            },
            [] as any[],
          );

          return elements;
        })}
      </g>
      {/* <g id="links">{map(events, (e) => getPath(e))}</g> */}
    </svg>
  );
}
