// TODO use Typescript and Browserify: https://www.typescriptlang.org/docs/handbook/integrating-with-build-tools.html#browserify
import * as d3 from "d3";
import moment from "moment";
import _ from "lodash";

/*
const d3 = require("d3");
const moment = require("moment");
const _ = require("lodash");
*/

// Constants
const WIDTH = 1200;
const HEIGHT = 1000;
const CIRCLE_RADIUS = 10;

interface Team {
  name: string;
  players: string[];
  won?: boolean;
  subs?: string[];
}

interface Tournament {
  name: string;
  start: string;
  end: string;
  teams: Team[];
}

interface TournamentNode {
  playerIndex: number;
  teamIndex: number;
  tournamentIndex: number;
}

interface TournamentLink {
  source: TournamentNode;
  target: TournamentNode;
  player?: string;
}

//// GLOBAL STATE ////

// Computed data points
let min: moment.MomentInput;
let max: moment.MomentInput;

// Functions that will be assigned
let x: (date: moment.MomentInput) => number;

function getNodes(tournaments: Tournament[]) {
  return _.reduce(
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
                  _.concat(acc3, { teamIndex, playerIndex, tournamentIndex }),
                [] as TournamentNode[],
              ),
            ),
          [],
        ),
      ),
    [],
  );
}

function getLinks(tournaments: Tournament[]) {
  // Basically we want a full list of links with source and target both being an index 3-tuple
  const inverseMap: Record<string, TournamentNode[]> = {};
  _.forEach(tournaments, (tournament, tournamentIndex) => {
    _.forEach(tournament.teams, (team, teamIndex) => {
      _.forEach(team.players, (player, playerIndex) => {
        if (!(player in inverseMap)) {
          inverseMap[player] = [];
        }
        inverseMap[player].push({ playerIndex, teamIndex, tournamentIndex });
      });
    });
  });

  console.log(inverseMap);

  // Compress inverseMap into all links
  return _.reduce(
    inverseMap,
    (acc, nodes, player) => {
      // Combine nodes into an array of links
      const links = [];
      for (let i = 0; i < nodes.length - 1; i++) {
        links.push({
          source: nodes[i],
          target: nodes[i + 1],
          player,
        });
      }
      return _.concat(acc, links);
    },
    [] as TournamentLink[],
  );
}

function draw(tournaments: Tournament[]) {
  min = _.get(_.minBy(tournaments, "start"), "start");
  max = _.get(_.maxBy(tournaments, "end"), "end");

  const baseX = d3
    .scaleLinear()
    .domain([0, moment(max).diff(min, "d")])
    .range([150 + CIRCLE_RADIUS, WIDTH - CIRCLE_RADIUS]);
  x = date => baseX(moment(date).diff(min, "d"));

  const chart = d3
    .select(".chart")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

  // Nodes
  const allNodes = getNodes(tournaments);

  const y = (d: TournamentNode) =>
    4 * CIRCLE_RADIUS + d.teamIndex * 5 * (2 * CIRCLE_RADIUS) + d.playerIndex * (2 * CIRCLE_RADIUS);

  const nodeSelection = chart
    .append("g")
    .attr("id", "nodes")
    .selectAll("circle")
    .data(allNodes)
    .enter()
    .append("g");

  nodeSelection
    .append("circle")
    .attr("cx", d => x(tournaments[d.tournamentIndex].start))
    .attr("cy", y)
    .attr("r", CIRCLE_RADIUS);

  nodeSelection
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", d => x(tournaments[d.tournamentIndex].start) - CIRCLE_RADIUS - 5)
    .attr("y", y)
    .html(d => tournaments[d.tournamentIndex].teams[d.teamIndex].players[d.playerIndex]);

  // Links
  const allLinks = getLinks(tournaments);
  chart
    .append("g")
    .attr("id", "links")
    .selectAll("line")
    .data(allLinks)
    .enter()
    .append("line")
    .attr("x1", d => x(tournaments[d.source.tournamentIndex].start))
    .attr("y1", (d: TournamentLink) => y(d.source))
    .attr("x2", d => x(tournaments[d.target.tournamentIndex].start))
    .attr("y2", (d: TournamentLink) => y(d.target))
    .attr("stroke", "black");

  // Tournament titles
  chart
    .append("g")
    .attr("id", "tournament-titles")
    .selectAll("text")
    .data(tournaments)
    .enter()
    .append("text")
    .attr("x", d => x(d.start))
    .attr("y", "1em")
    .attr("text-anchor", "middle")
    .html(d => d.name);
}

d3.json("data/tournaments.json").then(draw);
