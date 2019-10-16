import * as _ from "lodash";
import * as d3 from "d3";

import { Tournament, Chart, Team, RLVisualization } from "./types";
import { CIRCLE_RADIUS, WIDTH } from "./constants";

type TeamNode = Team & d3.SimulationNodeDatum;

export default class TeamSimulation implements RLVisualization {
  private teamNodes: TeamNode[];
  private x: d3.ScaleLinear<number, number>;

  process = (tournaments: Tournament[]) => {
    this.x = d3
      .scaleLinear()
      .domain([0, tournaments.length])
      .range([15 * CIRCLE_RADIUS + CIRCLE_RADIUS, WIDTH - CIRCLE_RADIUS]);

    console.log(this.x);

    // Build up teamNodes, a linear array of shit
    this.teamNodes = _.reduce(
      tournaments,
      (acc, tournament, tournamentIndex) =>
        _.concat(acc, _.map(tournament.teams, team => ({ ...team, tournamentIndex }))),
      [],
    );
  };

  draw = (chart: Chart) => {
    const simulation = d3.forceSimulation(this.teamNodes);

    // const link = getLinkElements(chart, allTeamLinks);
    const node = chart
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(this.teamNodes)
      .join("circle")
      .attr("r", 5);

    simulation.on("tick", () => {
      /*link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);*/

      node.attr("cx", d => d.x || null).attr("cy", d => d.y || null);
    });

    return simulation;
  };
}
