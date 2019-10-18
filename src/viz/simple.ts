import * as _ from "lodash";
import * as d3 from "d3";

import { Chart, Tournament, RLVisualization, TournamentLink, TournamentNode } from "../types";
import { getNodeId } from "../util";
import { CIRCLE_RADIUS, WIDTH } from "../constants";

export default class SimpleViz implements RLVisualization {
  private tournaments: Tournament[];
  private playerNodes: TournamentNode[];
  private samePlayerLinks: TournamentLink[];
  private x: d3.ScaleLinear<number, number>;

  private processPlayers = (tournaments: Tournament[]) => {
    this.playerNodes = _.reduce(
      tournaments,
      (acc1, tournament, tournamentIndex) =>
        _.concat(
          acc1,
          _.reduce(
            tournament.teams,
            (acc2, team, teamIndex) =>
              // TODO eventually add subs
              _.concat(
                acc2,
                _.reduce(
                  team.players,
                  (acc3, _player: string, playerIndex) =>
                    _.concat(acc3, {
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
  };

  private processPlayerLinks = (tournaments: Tournament[]) => {
    // Basically we want a full list of links with source and target both being an index 3-tuple
    // TODO can be replaced with reduce
    const inverseMap: Record<string, TournamentNode[]> = {};
    _.forEach(tournaments, (tournament, tournamentIndex) => {
      _.forEach(tournament.teams, (team, teamIndex) => {
        _.forEach(team.players, (player, playerIndex) => {
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
    this.samePlayerLinks = _.reduce(
      inverseMap,
      (acc, nodes) => {
        // Combine nodes into an array of links
        const links = [];
        for (let i = 0; i < nodes.length - 1; i++) {
          links.push({
            source: nodes[i], //getNodeId(nodes[i].tournamentIndex, nodes[i].teamIndex, nodes[i].playerIndex),
            target: nodes[i + 1], // getNodeId( nodes[i + 1].tournamentIndex, nodes[i + 1].teamIndex, nodes[i + 1].playerIndex, ),
          });
        }
        return _.concat(acc, links);
      },
      [] as TournamentLink[],
    );
  };

  process = (data: Tournament[]) => {
    this.tournaments = data;
    this.x = d3
      .scaleLinear()
      .domain([0, data.length])
      .range([15 * CIRCLE_RADIUS + CIRCLE_RADIUS, WIDTH - CIRCLE_RADIUS]);

    this.processPlayers(data);
    this.processPlayerLinks(data);
  };

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
      .attr("y1", (d: TournamentLink) => y(d.source))
      .attr("x2", d => this.x(d.target.tournamentIndex))
      .attr("y2", (d: TournamentLink) => y(d.target))
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
