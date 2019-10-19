import { select } from "d3-selection";

import { HEIGHT, WIDTH } from "./constants";
import { RLVisualization } from "./types";
// import Simple from "./viz/simple";
import Timeline from "./viz/timeline";

// import data from "./data/tournaments.json";
import data from "./data/players.json";

const viz: RLVisualization = new Timeline();

async function main() {
  // 1. Process data
  await viz.process(data);
  // 2. Build visualization
  await viz.draw(
    select("svg")
      .attr("width", WIDTH)
      .attr("height", HEIGHT),
  );
}

main();
