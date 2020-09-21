import { interpolateInferno, interpolateOrRd, scaleOrdinal, schemeAccent } from "d3";
import { forEach, map, size } from "lodash";
import React from "react";
import { Tournament } from "../types";
import { tournamentAcronym } from "../util";

interface Props {
  tournaments: Tournament[];
}

const process = (tournaments: Tournament[]) => {
  const seasonMap = {} as Record<string, number>;

  return map(tournaments, (t) => {
    const seasonCounts = {} as Record<string, number>;

    forEach(t.teams, (team) => {
      forEach(team.players, (player) => {
        if (!(player in seasonMap)) {
          seasonMap[player] = 1;
        } else {
          seasonMap[player]++;
        }
        seasonCounts[player] = seasonMap[player];
      });
    });

    return {
      tournament: t,
      seasonCounts,
    };
  });
};

export default function Text({ tournaments }: Props) {
  return (
    <table>
      <tbody>
        <tr>
          {map(tournaments, (t) => (
            <th>{tournamentAcronym(t.name)}</th>
          ))}
        </tr>
        <tr>
          {map(process(tournaments), ({ tournament: t, seasonCounts }) => (
            <td>
              <ul>
                {map(t.teams, (team) => (
                  <>
                    <li>{team.name}</li>
                    <ul>
                      {map(team.players, (p) => (
                        <li
                          style={{
                            backgroundColor: interpolateOrRd(seasonCounts[p] / size(tournaments)),
                          }}
                        >
                          {p}: <b>{seasonCounts[p]}</b>
                        </li>
                      ))}
                    </ul>
                  </>
                ))}
              </ul>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}
