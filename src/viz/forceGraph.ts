import { RLVisualization, Chart, Tournament, TournamentPlayerNode, TournamentLink } from "../types";
import { slice, size, get } from "lodash";
import d3 from "d3";
import { tournamentsToPlayerNodes, LINK_FORCE, getNodeId, getPlayerName, nodeDrag } from "../util";
import { CIRCLE_RADIUS } from "../constants";

interface Selections {
  node?: d3.Selection<SVGGElement, TournamentPlayerNode, any, any>;
  link?: d3.Selection<SVGLineElement, TournamentLink, any, any>;
}

// Data
let tournaments: Tournament[];
// UI
let simulation: d3.Simulation<TournamentPlayerNode, TournamentLink>;
let selections: Selections = {};
// UI x Data
let playerNodes: TournamentPlayerNode[];
let playerLinks: [];

const forceGraphViz: RLVisualization & Record<string, any> = {
  draw: (chart: Chart) => {
    // UI
    const uiArea = document.getElementById("ui-area");
    if (!uiArea) {
      return;
    }

    simulation = d3.forceSimulation<TournamentPlayerNode>(playerNodes).force(
      LINK_FORCE,
      d3
        .forceLink<TournamentPlayerNode, TournamentLink>()
        .id((d) => getNodeId(d.tournamentIndex, d.teamIndex, d.playerIndex))
        .links(playerLinks),
    );

    // Selections
    selections.node = chart.append("g").attr("id", "nodes").selectAll("circle");
    selections.link = chart.append("g").attr("id", "links").selectAll("line");

    const ticked = () => {
      selections
        .link!.attr("x1", (d) => get(d, "source.x"))
        .attr("y1", (d) => get(d, "source.y"))
        .attr("x2", (d) => get(d, "target.x"))
        .attr("y2", (d) => get(d, "target.y"));

      selections.node!.attr("transform", (d) => `translate(${d.x},${d.y})`);
    };

    simulation.on("tick", ticked);
  },

  process: () => {
    // noop
  },

  restart: () => {
    if (selections.node) {
      selections.node = selections.node.data(playerNodes, (d) => getPlayerName(tournaments, d));
      selections.node.exit().remove();
      selections.node = selections.node.enter().append("g").merge(selections.node);

      selections.node
        .append("circle")
        .attr("r", CIRCLE_RADIUS)
        .call(
          d3
            .drag()
            .on("start", nodeDrag.start.bind(null, simulation))
            .on("drag", nodeDrag.in)
            .on("end", nodeDrag.end.bind(null, simulation)),
        );
      selections.node
        .append("text")
        .attr("x", CIRCLE_RADIUS + 1)
        .attr("y", 3)
        .text((d: TournamentPlayerNode) => getPlayerName(tournaments, d));
    }

    if (selections.link) {
      selections.link = selections.link.data(
        playerLinks,
        (d) => `${(d.source as TournamentPlayerNode).id}-${(d.target as TournamentPlayerNode).id}`,
      );
      selections.link.exit().remove();
      selections.link = selections.link
        .enter()
        .append("line")
        .attr("stroke", "black")
        .merge(selections.link);
    }

    simulation.nodes(playerNodes);
    const linkForce = simulation.force(LINK_FORCE);
    if (linkForce) {
      (linkForce as d3.ForceLink<TournamentPlayerNode, TournamentLink>).links(playerLinks);
    }
    simulation.restart();
  },

  main: async (chart: Chart) => {
    const result = await fetch("http://localhost:5002/api/tournaments");
    const allTournaments: Tournament[] = await result.json();
    tournaments = slice(allTournaments, size(allTournaments) - 2); //0, 2);

    playerNodes = tournamentsToPlayerNodes(tournaments);

    forceGraphViz.draw(chart);

    forceGraphViz.process();
    forceGraphViz.restart();
  },
};

export default forceGraphViz;
