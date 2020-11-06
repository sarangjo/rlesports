import { scaleTime } from "d3-scale";
import {
  apply,
  assign,
  concat,
  forEach,
  get,
  keys,
  last,
  map,
  maxBy,
  minBy,
  range,
  reduce,
  set,
  size,
  slice,
  values,
} from "lodash";
import moment, { Moment } from "moment";
import React from "react";
import { CIRCLE_RADIUS, HEIGHT, MARGIN, SPACING } from "../constants";
import { EventType, PlayerEvent, Tournament } from "../types";
import { DATE_FORMAT, simpleY, toDate, tournamentAcronym, y } from "../util";

const BIG_WIDTH = 2500;

const TIMELINE_BUFFER = 10;

const Radius = {
  [EventType.JOIN]: 4,
  [EventType.LEAVE]: 5,
};
const FILL_LEAVE = "transparent";
const COLOR_UNKNOWN_TEAM = "#232323";
const COLOR_NO_TEAM = "#bbbbbb";

// Three inputs:
// - player events: join/leave team
//    - teams are evaluated based on the ones that participated in the tournaments
// - team info: colors, date range
// - tournaments: participants (team names could change), winners

const timelineY = (ti: number, pi: number) => simpleY(ti, pi, 6, TIMELINE_BUFFER);

const getIndices2 = (t: Tournament): Record<string, [number, number]> => {
  return reduce(
    t.teams,
    (acc, cur, teamIndex) => {
      return assign(
        acc,
        reduce(
          cur.players,
          (acc2, p, playerIndex) => {
            return assign(acc2, {
              [p]: [teamIndex, playerIndex],
            });
          },
          {},
        ),
      );
    },
    {},
  );
};

const getIndices = (t: Tournament, players: string[]): Record<string, number> => {
  let idx = 0;
  // First, tournament participants
  const indices = reduce(
    t.teams,
    (acc, cur) => {
      return assign(
        acc,
        reduce(
          cur.players,
          (acc2, p) => {
            return set(acc2, p, idx++);
          },
          {},
        ),
      );
    },
    {} as Record<string, number>,
  );

  // Then, unknown players
  forEach(players, (p) => {
    if (!(p in indices)) {
      indices[p] = idx++;
    }
  });

  return indices;
};

// Contract: each player's events are always sorted in time order. Tournaments are sorted.
export default function Timeline({
  tournaments,
  events,
  teams,
}: {
  tournaments: Tournament[];
  events: Record<string, PlayerEvent[]>;
  teams: Record<string, string>;
}) {
  if (size(tournaments) === 0) {
    return <div>Loading...</div>;
  }

  // Use tournament 0 to fix our starting Y.
  const indices = getIndices(tournaments[0], keys(events));

  // Most important function: given an event # and player, get its Y coordinate.
  const getY = (player: string, _eventNum: number, evType: EventType) => {
    if (!(player in indices)) {
      alert("Unknown player! " + player);
      return 0;
    }

    return 10 * SPACING + indices[player] * 2 * SPACING;
  };

  // Try 1: events
  const start = minBy(values(events), (e) => e[0].join);
  const end = maxBy(values(events), (e) => last(e)!.leave || last(e)!.join);

  if (!start || !end) {
    return (
      <b>
        Somethin's wrong! start {JSON.stringify(start)} or end {JSON.stringify(end)} are undefined
      </b>
    );
  }

  let startDate = start[0].join;
  let endDate = last(end)!.leave || last(end)!.join;

  // Try 2: tournaments
  startDate = startDate > tournaments[0].start ? tournaments[0].start : startDate;
  endDate = endDate < last(tournaments)!.end ? last(tournaments)!.end : endDate;

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

  return (
    <svg width={BIG_WIDTH} height={HEIGHT}>
      <g id="timeline">
        {map(range(0, moment(endDate).diff(startDate, "d"), 50), (days, i) => (
          <TimelineDate key={i} now={moment(startDate).add(days, "d")} />
        ))}
        {map(tournaments, (t) => (
          <>
            <TimelineDate now={moment(t.start)} />
            <TimelineDate now={moment(t.end)} />
          </>
        ))}
      </g>
      {/* <g id="nodes">
        {reduce(
          q1.teams,
          (acc, cur, teamIndex) => {
            return concat(
              acc,
              map(cur.players, (p, playerIndex) => {
                const myY = timelineY(teamIndex, playerIndex);
                return (
                  <g key={`${teamIndex}-${playerIndex}`}>
                    <circle
                      cx={q1x}
                      cy={myY}
                      r={CIRCLE_RADIUS}
                      stroke={Color.TOURNAMENT}
                      fill={Color.TOURNAMENT}
                    />
                    <text
                      textAnchor="end"
                      x={q1x - CIRCLE_RADIUS - CIRCLE_RADIUS / 2}
                      y={myY + CIRCLE_RADIUS / 2}
                    >
                      {p}
                    </text>
                  </g>
                );
              }),
            );
          },
          [] as any[],
        )}
      </g> */}
      <g id="events">
        {reduce(
          events,
          (acc, evs, player) => {
            // Processing a single player's events, we can produce the nodes and links in one iteration
            const lulw = reduce(
              evs,
              (acc2, e, idx) => {
                const color = e.team in teams ? teams[e.team] : COLOR_UNKNOWN_TEAM;

                // Join
                const joinX = x(toDate(e.join));
                const joinY = getY(player, idx, EventType.JOIN);
                acc2.push(
                  <g>
                    <circle
                      cx={joinX}
                      cy={joinY}
                      r={Radius[EventType.JOIN]}
                      stroke={color}
                      fill={color}
                    />
                    {idx === 0 && (
                      <text textAnchor="end" x={joinX - SPACING} y={joinY + SPACING / 2}>
                        {player}
                      </text>
                    )}
                  </g>,
                );

                // Link backward between events
                if (idx !== 0) {
                  const prevLeaveX = x(toDate(evs[idx - 1].leave!));
                  const prevLeaveY = getY(player, idx, EventType.LEAVE);

                  acc2.push(
                    <line
                      x1={prevLeaveX}
                      y1={prevLeaveY}
                      x2={joinX}
                      y2={joinY}
                      stroke={COLOR_NO_TEAM}
                    />,
                  );
                }

                // Leave?
                const leaveX = x(toDate(e.leave || endDate));
                const leaveY = getY(player, idx, EventType.LEAVE);
                if (e.leave) {
                  acc2.push(
                    <circle
                      cx={leaveX}
                      cy={leaveY}
                      r={Radius[EventType.LEAVE]}
                      stroke={color}
                      fill={FILL_LEAVE}
                    />,
                  );
                }

                acc2.push(
                  <line
                    x1={joinX}
                    y1={joinY}
                    x2={leaveX}
                    y2={leaveY}
                    stroke={color}
                    strokeWidth={3}
                  >
                    <title>{e.team}</title>
                  </line>,
                );

                return acc2;
              },
              [] as any[],
            );

            return concat(acc, lulw);
          },
          [] as any[],
        )}
      </g>
      {/* <g id="links">{map(events, (e) => getPath(e))}</g> */}
      <g id="tournaments">
        {map(tournaments, (t, idx) => {
          const thisX = x(toDate(t.start));
          const thisWidth = x(toDate(t.end)) - x(toDate(t.start));

          return (
            <g key={idx}>
              <rect x={thisX} y={0} width={thisWidth} height={HEIGHT} opacity={0.2} />
              <text
                x={thisX + thisWidth / 2}
                y={TIMELINE_BUFFER * CIRCLE_RADIUS}
                transform={`rotate(90,${thisX + thisWidth / 2},${TIMELINE_BUFFER * CIRCLE_RADIUS})`}
                // textLength={HEIGHT - TIMELINE_BUFFER * CIRCLE_RADIUS}
                // lengthAdjust="spacing"
              >
                {tournamentAcronym(t.name)}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
