import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import _ from "lodash";
import log from "loglevel";
import { HEIGHT, WIDTH } from "../constants";
import tournaments from "../data/tournaments.json";
import { Chart, RLVisualization, Tournament } from "../types";

export class SankeyViz implements RLVisualization {
  public process = () => {
    // Nodes are each team.
    // Links are
    const nodes: any[] = [];
    const links: any[] = [];
    _.forEach(tournaments, (tourney, i) => {
      // Add nodes for each team
      _.forEach(tourney.teams, team => {
        nodes.push({ name: `${team.name} at ${tourney.name}`, tournamentIndex: i });
      });
      // nodes.push({ name: `NONE at ${tourney.name}`, tournamentIndex: i });
    });

    _.forEach(tournaments.slice(0, tournaments.length - 1), (tourney, i) => {
      // Go through each player in each team and compose source/target
      _.forEach(tourney.teams, team => {
        _.forEach(team.players, player => {
          const destTeam = this.getName(tournaments[i + 1], player);
          if (destTeam) {
            links.push({
              source: `${team.name} at ${tourney.name}`,
              target: destTeam,
              value: 1,
              player,
            });
          }
        });
      });
    });

    return { nodes, links };
    /*return {
      nodes: [{ name: "Source 1" }, { name: "Source 2" }, { name: "Dest 1" }, { name: "Dest 2" }],
      links: [
        { source: "Source 1", target: "Dest 1", value: 1 },
        { source: "Source 1", target: "Dest 2", value: 1 },
        { source: "Source 2", target: "Dest 1", value: 1 },
      ],
    };*/
  };

  public main = (chart: Chart) => {
    // Set up nodes and links
    const data = this.process();

    const fn = sankey()
      .size([WIDTH, HEIGHT])
      .nodeId((d: any) => d.name)
      .nodeWidth(20)
      .nodePadding(10)
      .nodeAlign((d, n) => {
        log.debug(d, n);
        return _.get(d, "tournamentIndex");
      })
      .linkSort((a: any, b: any) => {
        return _.get(a, "player") - _.get(b, "player");
      });
    const graph = fn(data as any);

    // Links
    chart
      .append("g")
      .classed("links", true)
      .selectAll("path")
      .data(graph.links as any[])
      .enter()
      .append("path")
      .classed("link", true)
      .attr("d", sankeyLinkHorizontal())
      .attr("fill", "none")
      .attr("stroke", "#606060")
      .attr("stroke-width", d => d.width)
      .attr("stroke-opacity", 0.5)
      .append("title")
      .text(d => d.player);

    // Nodes
    chart
      .append("g")
      .classed("nodes", true)
      // .attr("stroke", "#000") // black border
      .selectAll("rect")
      .data(graph.nodes as any[])
      .enter()
      .append("rect")
      .classed("node", true)
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", "skyblue")
      .attr("opacity", 0.8)
      .append("title")
      .text(d => d.name);
  };

  private getName = (tourney: Partial<Tournament>, player: string) => {
    const team = _.get(
      _.find(tourney.teams, t => _.find(t.players, p => p === player)),
      "name",
    );
    return team ? `${team} at ${tourney.name}` : null;
  };
}
