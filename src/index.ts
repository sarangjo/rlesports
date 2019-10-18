import { select } from "d3-selection";
import _ from "lodash";
import log from "loglevel";

import { WIDTH, HEIGHT } from "./constants";
import { RLVisualization } from "./types";
// import TeamSim from "./team-sim";
import Timeline from "./viz/timeline";

import data from "./data/players.json";

const viz: RLVisualization = new Timeline();

async function main() {
  // 1. Process data
  await viz.process(data); // _.slice(data, 0, 2) for tournaments
  // 2. Build visualization
  const chart = select("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);
  log.debug(chart);
  await viz.draw(chart);
}

main();
