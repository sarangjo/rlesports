import { select } from "d3-selection";
import log from "loglevel";

import { HEIGHT, WIDTH } from "./constants";
import { RLVisualization } from "./types";
// import Simple from "./viz/simple";
// import Timeline from "./viz/timeline";

// import data from "./data/tournaments.json";
// import { SankeyViz } from "./viz/sankey";
import PlayerTeamsViz from "./viz/playerTeams";
import { SankeyViz } from "./viz/sankey";

log.setLevel("debug");

let viz: RLVisualization;
const chart = select("svg").attr("width", WIDTH).attr("height", HEIGHT);

function setView(view: string) {
  chart.selectAll("*").remove();

  switch (view) {
    case "sankey":
      viz = new SankeyViz();
      break;
    default:
      viz = new PlayerTeamsViz();
      break;
  }

  viz.main(chart);
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
