import { RLVisualization, Chart, Tournament, TournamentPlayerNode, TournamentLink } from "../types";
import { slice, size, get } from "lodash";
import * as d3 from "d3";
import { tournamentsToPlayerNodes, getPlayerName } from "../util";
import { CIRCLE_RADIUS, WIDTH, HEIGHT } from "../constants";

// Data
let tournaments: Tournament[];
// UI
let simulation: d3.Simulation<TournamentPlayerNode, TournamentLink>;
// UI x Data

const drag = (simulation: d3.Simulation<TournamentPlayerNode, TournamentLink>) => {
  function dragstarted(d: TournamentPlayerNode) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d: TournamentPlayerNode) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d: TournamentPlayerNode) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
};

/*
const getLinks = (tournaments: Tournament[]) => {
  let sameTeamSameTournamentLinks: TournamentLink[] = [];
  _.forEach(tournaments, (tournament, tournamentIndex) => {
    _.forEach(tournament.teams, (team, teamIndex) => {
      // Same team + same tournament
      sameTeamSameTournamentLinks = _.concat(
        sameTeamSameTournamentLinks,
        comb.combination(_.range(team.players.length), 2).map((pair) => ({
          source: getNodeId(tournamentIndex, teamIndex, pair[0]),
          target: getNodeId(tournamentIndex, teamIndex, pair[1]),
        })),
      );
    });
  });
};
*/

const forceGraphViz: RLVisualization = {
  main: async (chart: Chart) => {
    const result = await fetch("http://localhost:5002/api/tournaments");
    const allTournaments: Tournament[] = await result.json();
    tournaments = slice(allTournaments, size(allTournaments) - 2); //0, 2);

    const playerNodes = tournamentsToPlayerNodes(tournaments);
    const playerLinks: TournamentLink[] = [];

    const x = d3
      .scaleLinear()
      .domain([0, tournaments.length])
      .range([15 * CIRCLE_RADIUS + CIRCLE_RADIUS, WIDTH - CIRCLE_RADIUS]);

    // UI
    // chart.attr("viewBox", [-WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT] as any);

    simulation = d3
      .forceSimulation<TournamentPlayerNode>(playerNodes)
      // .force(
      //   LINK_FORCE,
      //   d3
      //     .forceLink<TournamentPlayerNode, TournamentLink>()
      //     .id((d) => getNodeId(d.tournamentIndex, d.teamIndex, d.playerIndex))
      //     .links(playerLinks),
      // )
      .force("charge", d3.forceManyBody())
      // .force("x", d3.forceX())
      .force("y", d3.forceY(HEIGHT / 2));

    // Selections
    let node: d3.Selection<SVGGElement, TournamentPlayerNode, any, any> = chart
      .append("g")
      .attr("id", "nodes")
      .selectAll("g");
    let link: d3.Selection<SVGLineElement, TournamentLink, any, any> = chart
      .append("g")
      .attr("id", "links")
      .selectAll("line");

    const ticked = () => {
      link
        .attr("x1", (d) => get(d, "source.x"))
        .attr("y1", (d) => get(d, "source.y"))
        .attr("x2", (d) => get(d, "target.x"))
        .attr("y2", (d) => get(d, "target.y"));
      node.attr("transform", (d) => {
        return `translate(${x(d.tournamentIndex)},${d.y})`;
      });
    };

    simulation.on("tick", ticked);

    node = node
      .data(playerNodes, (d) => getPlayerName(tournaments, d))
      .join((enter) =>
        enter
          .append("g")
          // Important to call drag on the same element that we correspond with the nodes
          // TODO move this logic to the playerTeams viz
          .call(drag(simulation))
          // append circle
          .call((n) => n.append("circle").attr("r", CIRCLE_RADIUS))
          // append text
          .call((n) =>
            n
              .append("text")
              .attr("x", CIRCLE_RADIUS + 1)
              .attr("y", 3)
              .text((d) => getPlayerName(tournaments, d)),
          ),
      );

    // TODO replace with above logic
    link = link.data(
      playerLinks,
      (d) => `${(d.source as TournamentPlayerNode).id}-${(d.target as TournamentPlayerNode).id}`,
    );
    link.exit().remove();
    link = link.enter().append("line").attr("stroke", "black").merge(link);
  },
};

export default forceGraphViz;
