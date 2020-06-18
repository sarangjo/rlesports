import * as d3 from "d3";
import { concat, forEach, reduce, slice, map, intersection, size } from "lodash";
import { CIRCLE_RADIUS, WIDTH } from "../constants";
import { Chart, RLVisualization, Tournament, TournamentLink, TournamentNode } from "../types";
import { getNodeId } from "../util";

const sort = (tournaments: Tournament[]): Tournament[] => {
  // TODO: based on adjacent tournaments, shuffle teams so that teams with more shared players are vertically close together
  return map(tournaments, (tournament, index) => {
    if (index === 0) {
      return tournament;
    }

    const prevTourn = tournaments[index - 1];

    const newIndices = map(tournament.teams, (team, teamIndex) => {
      return (
        reduce(
          prevTourn.teams,
          (acc, prevTeam, prevTeamIndex) => {
            return acc + prevTeamIndex * size(intersection(prevTeam.players, team.players));
          },
          0,
        ) / size(team.players)
      );
    });

    return tournament;
  });
};

const process = (t: Tournament[]): { nodes: TournamentNode[]; links: TournamentLink[] } => {
  const tournaments = sort(t);

  // First, collect all nodes for all tournaments
  const allNodes = reduce(
    tournaments,
    (acc1, tournament, tournamentIndex) =>
      concat(
        acc1,
        reduce(
          tournament.teams,
          (acc2, team, teamIndex) =>
            // TODO eventually add subs
            concat(
              acc2,
              reduce(
                team.players,
                (acc3, _player: string, playerIndex) =>
                  concat(acc3, {
                    tournamentIndex,
                    teamIndex,
                    playerIndex,
                    id: getNodeId(tournamentIndex, teamIndex, playerIndex),
                  }),
                [] as TournamentNode[],
              ),
            ),
          [],
        ),
      ),
    [],
  );

  // Basically we want a full list of links with source and target both being an index 3-tuple
  const inverseMap: Record<string, TournamentNode[]> = {};
  forEach(tournaments, (tournament, tournamentIndex) => {
    forEach(tournament.teams, (team, teamIndex) => {
      // // Same team + same tournament TODO uncomment eventually
      // sameTeamSameTournamentLinks.push(
      //   ...comb.combination(range(team.players.length), 2).map((pair) => ({
      //     source: getNodeId(tournamentIndex, teamIndex, pair[0]),
      //     target: getNodeId(tournamentIndex, teamIndex, pair[1]),
      //   })),
      // );

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
        links.push({
          source: nodes[i], // getNodeId(nodes[i].tournamentIndex, nodes[i].teamIndex, nodes[i].playerIndex),
          target: nodes[i + 1], // getNodeId( nodes[i + 1].tournamentIndex, nodes[i + 1].teamIndex, nodes[i + 1].playerIndex,),
        });
      }
      return concat(acc, links);
    },
    [] as TournamentLink[],
  );

  // allTeams = reduce(
  //   tournaments,
  //   (acc, tournament, tournamentIndex) =>
  //     concat(
  //       acc,
  //       map(tournament.teams, (team) => ({ ...team, tournamentIndex })),
  //     ),
  //   [],
  // );

  return { nodes: allNodes, links: samePlayerLinks };
};

const simpleViz: RLVisualization = {
  main: async (chart: Chart) => {
    const result = await fetch("http://localhost:5001/api/tournaments");
    const allTournaments: Tournament[] = await result.json();
    const tournaments = slice(allTournaments, 0, 2);

    const data = process(tournaments);

    const x = d3
      .scaleLinear()
      .domain([0, tournaments.length])
      .range([15 * CIRCLE_RADIUS + CIRCLE_RADIUS, WIDTH - CIRCLE_RADIUS]);

    // Nodes
    // y depends on team and player index
    const y = (d: TournamentNode) =>
      4 * CIRCLE_RADIUS +
      d.teamIndex * 5 * (2 * CIRCLE_RADIUS) +
      d.playerIndex * (2 * CIRCLE_RADIUS);

    const nodeSelection = chart
      .append("g")
      .attr("id", "nodes")
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("g");

    nodeSelection
      .append("circle")
      .attr("cx", (d) => x(d.tournamentIndex))
      .attr("cy", y)
      .attr("r", CIRCLE_RADIUS);

    nodeSelection
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", (d) => x(d.tournamentIndex) - CIRCLE_RADIUS - 5)
      .attr("y", y)
      .html((d) => tournaments[d.tournamentIndex].teams[d.teamIndex].players[d.playerIndex]);

    // Links
    chart
      .append("g")
      .attr("id", "links")
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("x1", (d) => x(d.source.tournamentIndex || 0)) // (typeof d.source === "string" ? x(getNode(d.source).tournamentIndex) : 0))
      .attr("y1", (d) => y(d.source))
      .attr("x2", (d) => x(d.target.tournamentIndex || 0))
      .attr("y2", (d) => y(d.target))
      .attr("stroke", "black");

    // Tournament titles
    chart
      .append("g")
      .attr("id", "tournament-titles")
      .selectAll("text")
      .data(tournaments)
      .enter()
      .append("text")
      .attr("x", (_d, i) => x(i))
      .attr("y", "1em")
      .attr("text-anchor", "middle")
      .html((d) =>
        d.name
          .split(/[^A-Za-z0-9]/)
          .map((word) => word[0])
          .join(""),
      );
  },
};

export default simpleViz;
