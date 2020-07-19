import * as comb from "js-combinatorics";
import { RLVisualization, Chart, Tournament, TournamentPlayerNode, SimulationLink } from "../types";
import { slice, size, get, forEach, concat, range, reduce, clamp } from "lodash";
import * as d3 from "d3";
import { tournamentsToPlayerNodes, getPlayerName, getNodeId } from "../util";
import { CIRCLE_RADIUS, WIDTH, HEIGHT } from "../constants";
import { sameTeamForce } from "../forces";

let tournaments: Tournament[];
let simulation: d3.Simulation<TournamentPlayerNode, SimulationLink>;

const drag = (simulation: d3.Simulation<TournamentPlayerNode, SimulationLink>) => {
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

function processPlayerLinks() {
  let sameTeamSameTournamentLinks: SimulationLink[] = [];

  // Basically we want a full list of links with source and target both being an index 3-tuple
  const inverseMap: Record<string, TournamentPlayerNode[]> = {};
  forEach(tournaments, (tournament, tournamentIndex) => {
    forEach(tournament.teams, (team, teamIndex) => {
      // Same team + same tournament
      sameTeamSameTournamentLinks = concat(
        sameTeamSameTournamentLinks,
        comb.combination(range(team.players.length), 2).map((pair) => ({
          source: {
            id: getNodeId(tournamentIndex, teamIndex, pair[0]),
            tournamentIndex,
            teamIndex,
            playerIndex: pair[0],
          },
          target: {
            id: getNodeId(tournamentIndex, teamIndex, pair[1]),
            tournamentIndex,
            teamIndex,
            playerIndex: pair[1],
          },
        })),
      );
      forEach(team.players, (player, playerIndex) => {
        if (!(player in inverseMap)) {
          inverseMap[player] = [];
        }
        inverseMap[player].push({
          playerIndex,
          teamIndex,
          tournamentIndex,
          id: getNodeId(tournamentIndex, teamIndex, playerIndex),
        });
      });
    });
  });

  // Compress inverseMap into all links
  const samePlayerLinks = reduce(
    inverseMap,
    (acc, nodes) => {
      // Combine nodes into an array of links
      const links = [];
      for (let i = 0; i < nodes.length - 1; i++) {
        // Note, these nodes aren't the same as the actual nodes
        links.push({
          source: getNodeId(nodes[i].tournamentIndex, nodes[i].teamIndex, nodes[i].playerIndex),
          target: getNodeId(
            nodes[i + 1].tournamentIndex,
            nodes[i + 1].teamIndex,
            nodes[i + 1].playerIndex,
          ),
        });
      }
      return concat(acc, links);
    },
    [] as SimulationLink[],
  );

  return samePlayerLinks; //concat(samePlayerLinks, sameTeamSameTournamentLinks);
}

const forceGraphViz: RLVisualization = {
  main: async (chart: Chart) => {
    // Set up tournaments
    const result = await fetch("http://localhost:5002/api/tournaments");
    const allTournaments: Tournament[] = await result.json();
    tournaments = slice(allTournaments, size(allTournaments) - 2); //0, 2);

    // Process data
    const playerNodes = tournamentsToPlayerNodes(tournaments);
    const playerLinks: SimulationLink[] = processPlayerLinks();

    // UI
    const x = d3
      .scaleLinear()
      .domain([0, tournaments.length])
      .range([15 * CIRCLE_RADIUS + CIRCLE_RADIUS, WIDTH - CIRCLE_RADIUS]);

    // Forces and tick behavior
    simulation = d3
      .forceSimulation<TournamentPlayerNode>(playerNodes)
      .force(
        "link",
        d3
          .forceLink<TournamentPlayerNode, SimulationLink>()
          .id((d) => getNodeId(d.tournamentIndex, d.teamIndex, d.playerIndex))
          .links(playerLinks),
      )
      .force("charge", d3.forceManyBody().strength(-35))
      .force("y", d3.forceY(HEIGHT / 2).strength(0.01))
      .force("collide", d3.forceCollide(CIRCLE_RADIUS + 2))
      .force("sameTeam", sameTeamForce().strength(0.8))
      .on("tick", () => {
        link
          .attr("x1", (d) => x((<TournamentPlayerNode>d.source).tournamentIndex))
          .attr("y1", (d) => clamp(get(d, "source.y"), 0, HEIGHT))
          .attr("x2", (d) => x((<TournamentPlayerNode>d.target).tournamentIndex))
          .attr("y2", (d) => clamp(get(d, "target.y"), 0, HEIGHT));
        node.attr("transform", (d) => {
          return `translate(${x(d.tournamentIndex)},${clamp(d.y || 0, 0, HEIGHT)})`;
        });
      });

    // Selections
    let node: d3.Selection<SVGGElement, TournamentPlayerNode, any, any> = chart
      .append("g")
      .attr("id", "nodes")
      .selectAll("g");
    let link: d3.Selection<SVGLineElement, SimulationLink, any, any> = chart
      .append("g")
      .attr("id", "links")
      .selectAll("line");

    // Drawing each circle
    node = node
      .data(playerNodes, (d) => getNodeId(d.tournamentIndex, d.teamIndex, d.playerIndex))
      .join((enter) =>
        enter
          .append("g")
          // Important to call drag on the same element that we correspond with the nodes
          // TODO move this logic to the playerTeams viz
          .call(drag(simulation))
          // append circle
          .call((n) => n.append("circle").attr("r", CIRCLE_RADIUS))
          .attr("id", (d) => d.id)
          // append text
          .call((n) =>
            n
              .append("text")
              .attr("x", CIRCLE_RADIUS + 1)
              .attr("y", 3)
              .text((d) => getPlayerName(tournaments, d)),
          ),
      );

    // Each link
    link = link
      .data(
        playerLinks,
        (d) => `${(d.source as TournamentPlayerNode).id}-${(d.target as TournamentPlayerNode).id}`,
      )
      .join((enter) => enter.append("line").attr("stroke", "black"));
  },
};

export default forceGraphViz;
