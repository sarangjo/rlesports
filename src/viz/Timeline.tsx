import { scaleTime } from "d3-scale";
import { assign, concat, find, forEach, isNull, map, range, reduce, size } from "lodash";
import moment, { Moment } from "moment";
import React from "react";
import { CIRCLE_RADIUS, MARGIN, SPACING } from "../constants";
import { PLAYERS } from "../data/sample/players";
import { EventType, Player, RlcsSeason, Tournament } from "../types";
import {
  DATE_FORMAT,
  findPlayer,
  getTeamColor,
  toDate,
  tournamentAcronym,
  tournamentMap,
} from "../util";

const BIG_WIDTH = 1200; // 5500;
// const BIG_HEIGHT = 2500;

const TIMELINE_BUFFER = 10;
const TIMELINE_SPACE = 10 * SPACING;

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

// getIndices sets up a record with lowercased mapping. It also includes alternate ID's.
// TODO this logic is shared between here and Table.tsx
const getIndices = (players: Player[]): Record<string, number> => {
  let idx = 0;
  return reduce(
    players,
    (acc, p) => {
      const myPart = {} as Record<string, number>;
      const myIndex = idx++;
      if (p.name.toLowerCase() in acc) {
        console.warn("ERROR ERROR DUPLICATE PLAYER!", p, "BUT WE PRIMARY SO WE BETTER!");
      }
      myPart[p.name.toLowerCase()] = myIndex;
      forEach(p.alternateIDs, (name) => {
        if (name.toLowerCase() in acc) {
          console.error("ERROR ERROR DUPLICATE PLAYER!", p, "LEAVING IT IN!");
        } else {
          myPart[name.toLowerCase()] = myIndex;
        }
      });
      return assign(acc, myPart);
    },
    {} as Record<string, number>,
  );
};

// Contract: each player's events are always sorted in time order. Tournaments are sorted.
export default function Timeline({
  seasons,
  players,
  teamColors,
}: {
  seasons: RlcsSeason[];
  players: Player[];
  teamColors: Record<string, string>;
}) {
  if (size(seasons) === 0) {
    return <div>Loading...</div>;
  }

  const indices = getIndices(players);

  // Given a vertical index, what's its Y coordinate?
  const y = (index: number) => TIMELINE_SPACE + index * 2 * SPACING;

  // Most important function: given an event # and player, get its Y coordinate.
  // We want to be as flexible as possible here, pname could be the main name, case-insensitive, or
  // alternate ID
  const getY = (pname: string, _eventNum?: number, _eventType?: EventType) => {
    // indices should be fully permissive for all lowercase, so a simple check suffices here.
    if (!(pname.toLowerCase() in indices)) {
      return null;
    }

    return y(indices[pname.toLowerCase()]);
  };

  console.log(PLAYERS);

  // Calculating minimum and maximum:
  // [min/max] Try 1: events
  // Start is the earliest join of any player
  const start = players?.reduce((acc, cur) => {
    return !acc || cur.memberships[0]?.join < acc ? cur.memberships[0]?.join : acc;
  }, "");
  // End is the latest leave of any player, or now if there are no leaves
  const end = players?.reduce((acc, cur) => {
    const interim =
      cur.memberships?.length > 0 && cur.memberships[cur.memberships.length - 1].leave;
    const candidate = interim || moment().format(DATE_FORMAT);
    return !acc || candidate > acc ? candidate : acc;
  }, "");

  console.log("start", start, "end", end);

  if (!start || !end) {
    return (
      <b>
        Somethin's wrong! start {JSON.stringify(start)} or end {JSON.stringify(end)} are undefined
      </b>
    );
  }

  // [min/max] Try 2: tournaments
  // startDate = startDate > tournaments[0].start ? tournaments[0].start : startDate;
  // endDate = endDate < last(tournaments)!.end ? last(tournaments)!.end : endDate;

  const x = scaleTime()
    .domain([toDate(start), toDate(end)])
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

  function TournamentComponent({ tournament: t }: { tournament: Tournament }) {
    const thisX = x(toDate(t.start));
    const thisWidth = x(toDate(t.end)) - x(toDate(t.start));

    return (
      <g key={t.name}>
        <rect x={thisX} y={0} width={thisWidth} height={y(size(indices))} opacity={0.2} />
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
                    key={p}
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
  }

  function PlayerComponent({ player }: { player: Player }) {
    // TODO filter out players that don't have tournaments visible in the view rn
    // Processing a single player's events, we can produce the nodes and links in one iteration
    const elements = reduce(
      player.memberships,
      (acc, mem, idx) => {
        const color = getTeamColor(mem.team, teamColors);

        // Join
        const joinX = x(toDate(mem.join));
        const joinY = getY(player.name, idx, EventType.JOIN)!;
        const circ = (
          <circle
            key={`${player.name}-join-${idx}`}
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
            <g key="playername">
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
              key={`${player.name}-teamless-${idx}`}
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
        const leaveX = x(toDate(mem.leave || end));
        const leaveY = getY(player.name, idx, EventType.LEAVE)!;
        if (mem.leave) {
          acc.push(
            <circle
              key={`${player.name}-leave-${idx}`}
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
            key={`${player.name}-team-${idx}`}
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

    return <>{elements}</>;
  }

  return (
    <svg width={BIG_WIDTH} height={y(size(indices))}>
      <g id="tournaments">
        {tournamentMap(seasons, (t) => (
          <TournamentComponent tournament={t} />
        ))}
      </g>
      <g id="timeline">
        {map(range(0, moment(end).diff(start, "d"), 50), (days, i) => (
          <TimelineDate key={i} now={moment(start).add(days, "d")} />
        ))}
        {tournamentMap(seasons, (t) => (
          <React.Fragment key={t.name}>
            <TimelineDate now={moment(t.start)} />
            <TimelineDate now={moment(t.end)} />
          </React.Fragment>
        ))}
      </g>
      <g id="events">
        {map(players, (player) => (
          <PlayerComponent key={player.name} player={player} />
        ))}
      </g>
    </svg>
  );
}
