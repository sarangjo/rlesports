import * as _ from "lodash";
import * as d3 from "d3";

import { Chart, Tournament, RLVisualization, Link, TournamentNode } from "../types";
import { getNodeId } from "../util";
import { CIRCLE_RADIUS, WIDTH } from "../constants";

export default class TimelineViz implements RLVisualization {
  private playerNodes: d3.SimulationNodeDatum[];
  private samePlayerLinks: Link[];

  process = () => {};

  draw = (chart: Chart) => {
    // Nodes
    const y = (d: TournamentNode) =>
      4 * CIRCLE_RADIUS +
      d.teamIndex * 5 * (2 * CIRCLE_RADIUS) +
      d.playerIndex * (2 * CIRCLE_RADIUS);

    const nodeSelection = chart
      .append("g")
      .attr("id", "nodes")
      .selectAll("circle")
      .data(this.playerNodes)
      .enter()
      .append("g");

    nodeSelection
      .append("circle")
      .attr("cx", d => this.x(d.tournamentIndex))
      .attr("cy", y)
      .attr("r", CIRCLE_RADIUS);

    nodeSelection
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", d => this.x(d.tournamentIndex) - CIRCLE_RADIUS - 5)
      .attr("y", y)
      .html(d => this.tournaments[d.tournamentIndex].teams[d.teamIndex].players[d.playerIndex]);

    // Links
    chart
      .append("g")
      .attr("id", "links")
      .selectAll("line")
      .data(this.samePlayerLinks)
      .enter()
      .append("line")
      .attr("x1", d => this.x(d.source.tournamentIndex))
      .attr("y1", (d: Link) => y(d.source))
      .attr("x2", d => this.x(d.target.tournamentIndex))
      .attr("y2", (d: Link) => y(d.target))
      .attr("stroke", "black");

    // Tournament titles
    chart
      .append("g")
      .attr("id", "tournament-titles")
      .selectAll("text")
      .data(this.tournaments)
      .enter()
      .append("text")
      .attr("x", (_d, i) => this.x(i))
      .attr("y", "1em")
      .attr("text-anchor", "middle")
      .html(d =>
        d.name
          .split(/[^A-Za-z0-9]/)
          .map(word => word[0])
          .join(""),
      );

    // Team names
    chart
      .append("g")
      .attr("id", "team-titles")
      .selectAll("text");
  };
}
