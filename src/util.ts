import * as d3 from "d3";
import { Tournament, TournamentPlayerNode } from "./types";
import { reduce, concat } from "lodash";
import { CIRCLE_RADIUS } from "./constants";

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
export const tournamentsToPlayerNodes = (tournaments: Tournament[]) => {
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

export const getPlayerName = (tournaments: Tournament[], d: TournamentPlayerNode) =>
  tournaments[d.tournamentIndex].teams[d.teamIndex].players[d.playerIndex];

// y depends on team and player index
export const y = (d: TournamentPlayerNode) =>
  4 * CIRCLE_RADIUS + d.teamIndex * 5 * (2 * CIRCLE_RADIUS) + d.playerIndex * (2 * CIRCLE_RADIUS);

export enum Viz {
  SANKEY = "sankey",
  TEAM_MAP = "team-map",
  FORCE_GRAPH = "force-graph",
  SIMPLE = "simple",
}

export const VizTitle = {
  [Viz.SANKEY]: "Sankey",
  [Viz.TEAM_MAP]: "Team Map",
  [Viz.FORCE_GRAPH]: "Force Graph",
  [Viz.SIMPLE]: "Simple",
};
