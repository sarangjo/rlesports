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
const WIDTH = 1600;
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

//// GLOBAL STATE ////

// Computed data points
let min: moment.MomentInput;
let max: moment.MomentInput;

// Functions that will be assigned
let x: (date: moment.MomentInput) => number;

function processTournaments(data: Tournament[]) {
  min = _.get(_.minBy(data, "start"), "start");
  max = _.get(_.maxBy(data, "end"), "end");

  const baseX = d3
    .scaleLinear()
    .domain([0, moment(max).diff(min, "d")])
    .range([CIRCLE_RADIUS, WIDTH - CIRCLE_RADIUS]);
  x = date => baseX(moment(date).diff(min, "d"));

  const chart = d3
    .select(".chart")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

  console.log(x, chart);

  // Zip up all tournament players
  const allNodes = _.reduce(
    data,
    (acc1, tournament) => {
      const tournamentNodes = _.reduce(
        tournament.teams,
        (acc2, team) => {
          // TODO eventually add subs
          return _.concat(
            acc2,
            _.map(team.players, player => ({
              name: player,
              start: tournament.start,
              end: tournament.end,
            })),
          );
        },
        [],
      );
      return _.concat(acc1, tournamentNodes);
    },
    [],
  );

  console.log(allNodes);

  /*
  const circles = chart
    .selectAll("circle")
    .data(rosterMoves)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.date))
    .attr("cy", () => CIRCLE_RADIUS + Math.random() * (HEIGHT - 2 * CIRCLE_RADIUS))
    .attr("r", CIRCLE_RADIUS);
    */
}

d3.json("data/tournaments.json").then(processTournaments);
