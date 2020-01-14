import { select } from "d3-selection";
import log from "loglevel";

import { HEIGHT, WIDTH } from "./constants";
import { RLVisualization } from "./types";
// import Simple from "./viz/simple";
import Timeline from "./viz/timeline";

// import data from "./data/tournaments.json";
import data from "./data/players.json";

log.setLevel("debug");

let viz: RLVisualization;
const chart = select("svg")
  .attr("width", WIDTH)
  .attr("height", HEIGHT);

function setView(view: string) {
  chart.selectAll("*").remove();

  switch (view) {
    default:
      viz = new Timeline();
    // TODO process data so we simply pass in v simple player nodes and team info
  }

  viz.main(data, chart);
}

// Init
setView("team-map");

// User input
const vizSelect = document.getElementById("viz");
if (vizSelect) {
  vizSelect.addEventListener("change", () => {
    setView((vizSelect as HTMLSelectElement).value);
  });
}
