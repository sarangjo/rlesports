import { scaleTime } from "d3-scale";
import {
  assign,
  concat,
  forEach,
  isNull,
  last,
  map,
  maxBy,
  minBy,
  range,
  reduce,
  set,
  size,
} from "lodash";
import moment, { Moment } from "moment";
import React from "react";
import { CIRCLE_RADIUS, HEIGHT, MARGIN, SPACING } from "../constants";
import { EventType, Player, OldTournament } from "../types";
import { DATE_FORMAT, getTeamColor, toDate, tournamentAcronym } from "../util";

const BIG_WIDTH = 5500;
const BIG_HEIGHT = 2500;

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

const getIndices = (t: OldTournament, players: string[]): Record<string, number> => {
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
  events: players,
  teams,
}: {
  tournaments: OldTournament[];
  events: Player[];
  teams: Record<string, string>;
}) {
  if (size(tournaments) === 0) {
    return <div>Loading...</div>;
  }

  // Use tournament 0 to fix our starting Y.
  const indices = getIndices(
    tournaments[0],
    map(players, (p) => p.name),
  );

  // Most important function: given an event # and player, get its Y coordinate.
  const getY = (player: string, _eventNum?: number, _eventType?: EventType) => {
    if (!(player in indices)) {
      return null;
    }

    return 10 * SPACING + indices[player] * 2 * SPACING;
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

  let startDate = start.memberships[0].join;
  let endDate = last(end.memberships)!.leave || last(end.memberships)!.join;

  // [min/max] Try 2: tournaments
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
    <svg width={BIG_WIDTH} height={BIG_HEIGHT}>
      <g id="tournaments">
        {map(tournaments, (t, idx) => {
          const thisX = x(toDate(t.start));
          const thisWidth = x(toDate(t.end)) - x(toDate(t.start));

          return (
            <g key={idx}>
              <rect x={thisX} y={0} width={thisWidth} height={BIG_HEIGHT} opacity={0.2} />
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
                (acc, cur) => {
                  return concat(
                    acc,
                    map(cur.players, (p) => {
                      const myY = getY(p);
                      if (isNull(myY)) {
                        return undefined;
                      }

                      return (
                        <rect
                          x={thisX}
                          y={myY - CIRCLE_RADIUS / 2 - STROKE_WIDTH_TEAM / 2}
                          width={thisWidth}
                          height={CIRCLE_RADIUS + STROKE_WIDTH_TEAM}
                          opacity={0.3}
                        />
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
        {map(tournaments, (t) => (
          <>
            <TimelineDate now={moment(t.start)} />
            <TimelineDate now={moment(t.end)} />
          </>
        ))}
      </g>
      <g id="events">
        {reduce(
          players,
          (acc, player) => {
            // TODO filter out players that don't have tournaments visible in the view rn
            // Processing a single player's events, we can produce the nodes and links in one iteration
            const elements = reduce(
              player.memberships,
              (acc2, mem, idx) => {
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
                acc2.push(
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

                  acc2.push(
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
                  acc2.push(
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

                acc2.push(
                  <line
                    id={`${player.name}-team-${mem.team}`}
                    x1={joinX}
                    y1={joinY}
                    x2={leaveX}
                    y2={leaveY}
                    stroke={color}
                    strokeWidth={STROKE_WIDTH_TEAM}
                  >
                    <title>{mem.team}</title>
                  </line>,
                );

                return acc2;
              },
              [] as any[],
            );

            return concat(acc, elements);
          },
          [] as any[],
        )}
      </g>
      {/* <g id="links">{map(events, (e) => getPath(e))}</g> */}
    </svg>
  );
}
