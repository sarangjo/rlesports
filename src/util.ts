import * as d3 from "d3";

//// UTILITY

export const getNodeId = (...indices: number[]): string => indices.join("-");

export const getNode = (id: string): Record<string, number> =>
  id.split("-").reduce((acc, n, i) => {
    acc[i === 0 ? "tournamentIndex" : i === 1 ? "teamIndex" : "playerIndex"] = Number.parseInt(n);
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
  start: (d: d3.SimulationNodeDatum) => {
    d.fx = d.x;
    d.fy = d.y;
  },
  in: (d: d3.SimulationNodeDatum) => {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  },
  end: (d: d3.SimulationNodeDatum) => {
    d.fx = null;
    d.fy = null;
  },
};
