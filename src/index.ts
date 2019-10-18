import * as d3 from "d3";
import * as _ from "lodash";

import { WIDTH, HEIGHT } from "./constants";
import { RLVisualization } from "./types";
// import TeamSim from "./team-sim";
import Timeline from "./viz/timeline";

const viz: RLVisualization = new Timeline();

async function main() {
  // 1. Read data
  const data = await d3.json("data/players.json");
  // 2. Process data
  await viz.process(data); // _.slice(data, 0, 2) for tournaments
  // 3. Build visualization
  const chart = d3
    .select(".chart")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);
  await viz.draw(chart);
}

main();
