import * as d3scale from "d3-scale";
import { apply, assign, concat, map, range, reduce, size } from "lodash";
import moment, { Moment } from "moment";
import React from "react";
import { CIRCLE_RADIUS, HEIGHT, WIDTH } from "../constants";
import { Tournament } from "../types";
import { DATE_FORMAT, simpleY, toDate, y } from "../util";

import events from "./events.json";

const START = "2015-05-29";
const END = "2016-05-01";

// color used for player events
enum Color {
  JOIN_TEAM = "gray",
  TOURNAMENT = "black",
}

const timelineY = (ti: number, pi: number) => simpleY(ti, pi, 6, 10);

export default function Timeline({ tournaments }: { tournaments: Tournament[] }) {
  const x = d3scale
    .scaleTime()
    .domain([toDate(START), toDate(END)])
    .range([CIRCLE_RADIUS, WIDTH - CIRCLE_RADIUS]);

  if (size(tournaments) === 0) {
    return <div>Loading...</div>;
  }

  const q1 = tournaments[0];

  const q1x = x(toDate(q1.start));

  const date = (now: Moment) => (
    <text
      fontSize={10}
      x={x(now.toDate())}
      y={CIRCLE_RADIUS}
      transform={`rotate(90,${x(now.toDate())},${CIRCLE_RADIUS})`}
      // textLength={(d.y1 || 0) - (d.y0 || 0)}
      // lengthAdjust="spacing"
    >
      {now.format(DATE_FORMAT)}
    </text>
  );

  const indices: Record<string, [number, number]> = reduce(
    q1.teams,
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

  console.log(indices);

  const getPath = (e: { date: string; name: string }) => {
    const myIndex = indices[e.name];

    if (!myIndex) {
      return null;
    }

    // 1 is event, 2 is tournament
    const x1 = x(toDate(e.date));
    const x2 = q1x;
    const pathY = timelineY(myIndex[0], myIndex[1]);

    return <line x1={x1} y1={pathY} x2={x2} y2={pathY} stroke="black" />;
  };

  return (
    <svg width={WIDTH} height={HEIGHT}>
      <g id="timeline">
        {map(range(0, moment(END).diff(START, "d"), 50), (days) =>
          date(moment(START).add(days, "d")),
        )}
        {date(moment(q1.start))}
      </g>
      <g id="nodes">
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
        {map(events, (e) => {
          const myIndex = indices[e.name];
          if (!myIndex) {
            console.log("couldnt find", e.name);
            return null;
          }
          return (
            <circle
              cx={x(toDate(e.date))}
              cy={timelineY(myIndex[0], myIndex[1])}
              r={CIRCLE_RADIUS}
              stroke={Color.JOIN_TEAM}
              fill={Color.JOIN_TEAM}
            />
          );
        })}
      </g>
      <g id="links">{map(events, (e) => getPath(e))}</g>
    </svg>
  );
}
