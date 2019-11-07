import { SimulationNodeDatum } from "d3-force";
import { event } from "d3-selection";

//// UTILITY

export const getNodeId = (...indices: number[]): string => indices.join("-");

export const getNode = (id: string): Record<string, number> =>
  id.split("-").reduce((acc, n, i) => {
    acc[i === 0 ? "tournamentIndex" : i === 1 ? "teamIndex" : "playerIndex"] = +n;
    return acc;
  }, {});

export const getLinkElements = (chart: any, links: any[]) =>
  chart
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line");

export const nodeDrag = {
  start: (simulation: any, d: SimulationNodeDatum) => {
    if (!event.active) {
      simulation.alphaTarget(0.3).restart();
    }
    d.fx = d.x;
    d.fy = d.y;
  },
  in: (d: SimulationNodeDatum) => {
    d.fx = event.x;
    d.fy = event.y;
  },
  end: (simulation: any, d: SimulationNodeDatum) => {
    if (!event.active) {
      simulation.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;
  },
};

// Used to set group curve for teams
/*
export const valueline =
  line()
  .x(d => d[0])
  .y(d => d[1])
  .curve(curveCatmullRomClosed);
  */
