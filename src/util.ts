import * as d3 from "d3";
import { concat, forEach, map, pickBy, reduce, some, sum } from "lodash";
import moment from "moment";
import { CIRCLE_RADIUS } from "./constants";
import { OldTournament, TournamentPlayerNode } from "./types";

//// UTILITY

export const getNodeId = (...indices: number[]): string => indices.join("-");

export const getNode = (id: string): TournamentPlayerNode =>
  id.split("-").reduce((acc, n, i) => {
    acc[i === 0 ? "tournamentIndex" : i === 1 ? "teamIndex" : "playerIndex"] = +n;
    return acc;
  }, {} as TournamentPlayerNode);

export const getLinkElements = (chart: any, links: any[]) =>
  chart
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line");

export const nodeDrag = {
  start: (simulation: any, d: d3.SimulationNodeDatum) => {
    if (!d3.event.active) {
      simulation.alphaTarget(0.3).restart();
    }
    d.fx = d.x;
    d.fy = d.y;
  },
  in: (d: d3.SimulationNodeDatum) => {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  },
  end: (simulation: any, d: d3.SimulationNodeDatum) => {
    if (!d3.event.active) {
      simulation.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;
  },
};

// Used to set group curve for teams
export const valueline = d3
  .line()
  .x((d) => d[0])
  .y((d) => d[1])
  .curve(d3.curveCatmullRomClosed);

// Data managing
export const tournamentsToPlayerNodes = (tournaments: OldTournament[]) => {
  return reduce(
    tournaments,
    (acc1, tournament, tournamentIndex) =>
      concat(
        acc1,
        reduce(
          tournament.teams,
          (acc2, team, teamIndex) =>
            // TODO eventually add subs
            concat(
              acc2,
              reduce(
                team.players,
                (acc3, _player: string, playerIndex) =>
                  concat(acc3, {
                    tournamentIndex,
                    teamIndex,
                    playerIndex,
                    id: getNodeId(tournamentIndex, teamIndex, playerIndex),
                    x: 0,
                    y: y({
                      tournamentIndex,
                      teamIndex,
                      playerIndex,
                      id: getNodeId(tournamentIndex, teamIndex, playerIndex),
                    }), // teamIndex <= tournament.teams.length / 2 ? 0 : HEIGHT,
                  }),
                [] as TournamentPlayerNode[],
              ),
            ),
          [] as TournamentPlayerNode[],
        ),
      ),
    [] as TournamentPlayerNode[],
  );
};

export const LINK_FORCE = "link";

export const getPlayerName = (tournaments: OldTournament[], d: TournamentPlayerNode) =>
  tournaments[d.tournamentIndex].teams[d.teamIndex].players[d.playerIndex];

// y depends on team and player index
export const y = (d: TournamentPlayerNode) => simpleY(d.teamIndex, d.playerIndex);

export const simpleY = (teamIndex: number, playerIndex: number, playersPerTeam = 5, buffer = 4) =>
  // buffer
  buffer * CIRCLE_RADIUS +
  // team spacing
  teamIndex * playersPerTeam * (2 * CIRCLE_RADIUS) +
  // player spacing
  playerIndex * (2 * CIRCLE_RADIUS);

export const tournamentAcronym = (name: string) =>
  name.replaceAll(/[^A-Z0-9\/]/g, "").replaceAll("/", " ");
// .split(/[^A-Za-z0-9]/)
// .map((word) => word[0])
// .join("");

export enum Viz {
  SANKEY = "sankey",
  TEAM_MAP = "team-map",
  FORCE_GRAPH = "force-graph",
  SIMPLE = "simple",
  TABLE = "table",
  TEXT = "text",
  TIMELINE = "timeline",
}

export const VizTitle = {
  [Viz.SANKEY]: "Sankey",
  [Viz.TEAM_MAP]: "Team Map",
  [Viz.FORCE_GRAPH]: "Force Graph",
  [Viz.SIMPLE]: "Simple",
  [Viz.TABLE]: "Table",
  [Viz.TEXT]: "Text",
  [Viz.TIMELINE]: "Timeline",
};

// Map numerical enum
export const mapEnum = (x: any, iter: (val: number, key: string) => any) => {
  return map(
    pickBy(x, (val) => {
      return typeof val === "number";
    }),
    iter,
  );
};

export const DATE_FORMAT = "YYYY-MM-DD";

export const toDate = (d: string): Date => moment(d, DATE_FORMAT).toDate();

const COLOR_UNKNOWN_TEAM = "#232323";

export const getTeamColor = (team: string, teams: Record<string, string>) =>
  team in teams ? teams[team] : COLOR_UNKNOWN_TEAM;

// domain needs to be increasing order, each element needs to be 0 < 1
export function scaleTimeDisjoint(
  domain: Array<[string, string]>,
  range: [number, number],
  input: string,
) {
    // TODO: Create a class that persists until output declaration
  // Calculate the date ranges involved in each
  const dateDiffs = map(domain, (r) => {
    return moment(r[1]).diff(moment(r[0]), "days");
  });

  const totalDiff = sum(dateDiffs);

  let output = range[0];

  // Find the date range index that we live in
  some(domain, (r, i) => {
    const totalX = (dateDiffs[i] / totalDiff) * (range[1] - range[0]);
    if (r[0] <= input && input <= r[1]) {
      // Add our local diff
      const localDiff = moment(input).diff(moment(r[0]), "days");
      output += (localDiff / dateDiffs[i]) * totalX;
      return true;
    }
    output += totalX;
  });

  return output;
}
