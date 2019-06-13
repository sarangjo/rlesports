import * as d3 from "d3";
import comb from "js-combinatorics";
// import moment from "moment";
import _ from "lodash";

/*
const d3 = require("d3");
const moment = require("moment");
const _ = require("lodash");
*/

// Constants
const WIDTH = 2400;
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

interface TournamentNode extends d3.SimulationNodeDatum {
  playerIndex: number;
  teamIndex: number;
  tournamentIndex: number;
  id: string; // combination of indices
}

type Link = d3.SimulationLinkDatum<TournamentNode>;

//// GLOBAL STATE ////

// Computed data points
// let min: moment.MomentInput;
// let max: moment.MomentInput;

// Functions that will be assigned
let x: (idx: number) => number;

let tournaments: Tournament[];
let allNodes: TournamentNode[];
let sameTeamSameTournamentLinks: Link[] = [];
let samePlayerLinks: Link[];

function getNodes() {
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
}

//// UTILITY

const getNodeId = (...indices: number[]): string => indices.join("-");
// @ts-ignore
const getNode = (id: string): Record<string, number> =>
  id.split("-").reduce((acc, n, i) => {
    acc[i === 0 ? "tournamentIndex" : i === 1 ? "teamIndex" : "playerIndex"] = Number.parseInt(n);
    return acc;
  }, {});

// FORCES
// 1. Nodes in the same team + tournament = attraction force? link force with repulsion?
// 2. Nodes with the same player = link force
// 3. Bounding box by tournament
// 4. Nodes in the same tournament + different teams = repulsion force among

function getLinks() {
  // Basically we want a full list of links with source and target both being an index 3-tuple
  const inverseMap: Record<string, TournamentNode[]> = {};
  _.forEach(tournaments, (tournament, tournamentIndex) => {
    _.forEach(tournament.teams, (team, teamIndex) => {
      // Same team + same tournament
      sameTeamSameTournamentLinks = _.concat(
        sameTeamSameTournamentLinks,
        comb.combination(_.range(team.players.length), 2).map(pair => ({
          source: getNodeId(tournamentIndex, teamIndex, pair[0]),
          target: getNodeId(tournamentIndex, teamIndex, pair[1]),
        })),
      );
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

  console.log(sameTeamSameTournamentLinks);

  // Compress inverseMap into all links
  return _.reduce(
    inverseMap,
    (acc, nodes) => {
      // Combine nodes into an array of links
      const links = [];
      for (let i = 0; i < nodes.length - 1; i++) {
        links.push({
          source: getNodeId(nodes[i].tournamentIndex, nodes[i].teamIndex, nodes[i].playerIndex),
          target: getNodeId(
            nodes[i + 1].tournamentIndex,
            nodes[i + 1].teamIndex,
            nodes[i + 1].playerIndex,
          ),
        });
      }
      return _.concat(acc, links);
    },
    [] as Link[],
  );
}

function forceSimulation(chart: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
  const simulation = d3
    .forceSimulation(allNodes)
    .force(
      "link",
      d3
        .forceLink(samePlayerLinks)
        .id((d: TournamentNode) => d.id)
        .strength(0.1),
    )
    .force("charge", d3.forceManyBody().strength(0.2))
    .force(
      "x",
      d3
        .forceX<TournamentNode>()
        .x(d => x(d.tournamentIndex))
        .strength(1),
    )
    .force(
      "y",
      d3
        .forceY()
        .y(HEIGHT / 2)
        .strength(0.1),
    )
    // Force among teams
    .force(
      "sameTeamSameTournament",
      d3
        .forceLink(sameTeamSameTournamentLinks)
        .id((d: TournamentNode) => d.id)
        .strength(1),
    );

  const link = chart
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(samePlayerLinks)
    .join("line");
  // .attr("stroke-width", d => Math.sqrt(d.value));

  const node = chart
    .append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(allNodes)
    .join("circle")
    .attr("r", 5);
  // .attr("fill", color)
  // .call(drag(simulation));

  node
    .append("title")
    .text(
      d =>
        `${d.tournamentIndex}-${d.teamIndex}-${d.playerIndex} ${
          tournaments[d.tournamentIndex].teams[d.teamIndex].players[d.playerIndex]
        }`,
    );

  const setPositions = () => {
    link
      .attr("x1", d => (d.source as any).x)
      .attr("y1", d => (d.source as any).y)
      .attr("x2", d => (d.target as any).x)
      .attr("y2", d => (d.target as any).y);

    node.attr("cx", d => d.x || null).attr("cy", d => d.y || null);
  };

  // Ticks
  simulation.on("tick", setPositions);
}

// @ts-ignore
function _simpleTimeline(chart: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
  // Nodes
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
    .attr("cx", d => x(d.tournamentIndex))
    .attr("cy", y)
    .attr("r", CIRCLE_RADIUS);

  nodeSelection
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", d => x(d.tournamentIndex) - CIRCLE_RADIUS - 5)
    .attr("y", y)
    .html(d => tournaments[d.tournamentIndex].teams[d.teamIndex].players[d.playerIndex]);

  // Links
  chart
    .append("g")
    .attr("id", "links")
    .selectAll("line")
    .data(samePlayerLinks)
    .enter()
    .append("line")
    /*
    .attr("x1", d => (typeof d.source === "string" ? x(getNode(d.source).tournamentIndex) : 0))
    .attr("y1", (d: Link) => y(d.source))
    .attr("x2", d => x(d.target.tournamentIndex))
    .attr("y2", (d: Link) => y(d.target))
    */
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
    .html(d =>
      d.name
        .split(/[^A-Za-z0-9]/)
        .map(word => word[0])
        .join(""),
    );
}

function processData() {
  allNodes = getNodes();
  samePlayerLinks = getLinks();
}

function draw(data: Tournament[]) {
  tournaments = data;
  processData();

  // min = _.get(_.minBy(tournaments, "start"), "start");
  // max = _.get(_.maxBy(tournaments, "end"), "end");

  // const baseX = d3
  //   .scaleLinear()
  //   .domain([0, moment(max).diff(min, "d")])
  //   .range([150 + CIRCLE_RADIUS, WIDTH - CIRCLE_RADIUS]);
  // x = date => baseX(moment(date).diff(min, "d"));

  x = d3
    .scaleLinear()
    .domain([0, tournaments.length])
    .range([150 + CIRCLE_RADIUS, WIDTH - CIRCLE_RADIUS]);

  const chart = d3
    .select(".chart")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

  // _simpleTimeline(chart);
  forceSimulation(chart);
}

d3.json("data/tournaments.json").then(draw);
