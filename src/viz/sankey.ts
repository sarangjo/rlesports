import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import _, { find, forEach, get } from "lodash";
import log from "loglevel";
import { HEIGHT, WIDTH } from "../constants";
import { Chart, RLVisualization, Tournament } from "../types";

const sankeyViz: RLVisualization & Record<string, Function> = {
  main: async (chart: Chart) => {
    const result = await fetch("http://localhost:5002/api/tournaments");
    const tournaments: Tournament[] = await result.json();

    // Set up nodes and links
    const data = sankeyViz.processTournaments(tournaments);

    const fn = (sankey()
      .size([WIDTH, HEIGHT])
      .nodeId((d: any) => d.name)
      .nodeWidth(20)
      .nodePadding(10)
      .nodeAlign((d, n) => {
        log.debug(d, n);
        return _.get(d, "tournamentIndex");
      }) as any).linkSort((a: any, b: any) => {
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
      .attr("stroke-width", (d) => d.width)
      .attr("stroke-opacity", 0.5)
      .append("title")
      .text((d) => d.player);

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
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", "skyblue")
      .attr("opacity", 0.8)
      .append("title")
      .text((d) => d.name);
  },

  processTournaments: (tournaments: Tournament[]): { nodes: any[]; links: any[] } => {
    // Nodes are each team.
    // Links are
    const nodes: any[] = [];
    const links: any[] = [];
    forEach(tournaments, (tourney, i) => {
      // Add nodes for each team
      forEach(tourney.teams, (team) => {
        nodes.push({ name: `${team.name} at ${tourney.name}`, tournamentIndex: i });
      });
      // nodes.push({ name: `NONE at ${tourney.name}`, tournamentIndex: i });
    });

    forEach(tournaments.slice(0, tournaments.length - 1), (tourney, i) => {
      // Go through each player in each team and compose source/target
      forEach(tourney.teams, (team) => {
        forEach(team.players, (player) => {
          const destTeam = sankeyViz.getName(tournaments[i + 1], player);
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
  },

  getName: (tourney: Tournament, player: string) => {
    const team = get(
      find(tourney.teams, (t) => find(t.players, (p) => p === player)),
      "name",
    );
    return team ? `${team} at ${tourney.name}` : null;
  },
};

export default sankeyViz;
