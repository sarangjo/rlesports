import { interpolateOrRd } from "d3";
import { forEach, map, reduce, size, sum, values } from "lodash";
import React, { useMemo } from "react";
import { RlcsSeason, Tournament } from "../types";
import { ordinalSuffixOf, tournamentAcronym, tournamentMap } from "../util";

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

const rookiePercentage = (seasonCounts: Record<string, number>) => {
  const [rookies, nonRookies] = reduce(
    seasonCounts,
    (acc, cur) => {
      acc[cur === 1 ? 0 : 1]++;
      return acc;
    },
    [0, 0],
  );
  return (100 * rookies) / (rookies + nonRookies);
};

const average = (seasonCounts: Record<string, number>) => {
  return sum(values(seasonCounts)) / size(seasonCounts);
};

export default function Text({ seasons }: { seasons: RlcsSeason[] }) {
  const tournaments = useMemo(() => tournamentMap(seasons, (t) => t), [seasons]);

  const processed = process(tournaments);

  return (
    <table>
      <tbody>
        <tr>
          <th />
          {map(tournaments, (t, i) => (
            <th key={i}>{tournamentAcronym(t.name)}</th>
          ))}
        </tr>
        <tr style={{ textAlign: "center" }}>
          <td>Percentage of rookies</td>
          {map(processed, ({ seasonCounts }) => (
            <td>{Math.round(rookiePercentage(seasonCounts) * 100) / 100}</td>
          ))}
        </tr>
        <tr style={{ textAlign: "center" }}>
          <td>Average age</td>
          {map(processed, ({ seasonCounts }) => (
            <td>{ordinalSuffixOf(Math.round(average(seasonCounts) * 100) / 100)}</td>
          ))}
        </tr>
        <tr>
          <td>Details</td>
          {map(processed, ({ tournament: t, seasonCounts }) => (
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
                          {p}: <b>{seasonCounts[p]}th season</b>
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
