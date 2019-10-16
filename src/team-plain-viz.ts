import * as _ from "lodash";
import * as d3 from "d3";

import { Tournament, Chart, Team, RLVisualization } from "./types";
import { CIRCLE_RADIUS, WIDTH } from "./constants";

interface TeamNode extends Team {
  tournamentIndex: number;
}

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
    /*
    const y = (d: TeamNode) =>
      CIRCLE_RADIUS * 2 + // offset
      d.tournamentIndex * 5 * 2 * CIRCLE_RADIUS;
      */

    // const link = getLinkElements(chart, allTeamLinks);
    chart
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(this.teamNodes)
      .join("circle")
      .attr("r", 5);
  };
}
