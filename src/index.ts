import { select } from "d3-selection";
import log from "loglevel";

import { HEIGHT, WIDTH } from "./constants";
import { RLVisualization } from "./types";
// import Simple from "./viz/simple";
// import Timeline from "./viz/timeline";

// import data from "./data/tournaments.json";
// import { SankeyViz } from "./viz/sankey";
import playerTeamsViz from "./viz/playerTeams";
import sankeyViz from "./viz/sankey";

log.setLevel("debug");

let viz: RLVisualization;
const chart = select("svg").attr("width", WIDTH).attr("height", HEIGHT);

// Removes all elements in the view
function clear() {
  chart.selectAll("*").remove();
  const uiArea = document.getElementById("ui-area");
  while (uiArea && uiArea.firstChild) {
    uiArea.removeChild(uiArea.lastChild!);
  }
}

function setView(view: string) {
  clear();

  switch (view) {
    case "sankey":
      viz = sankeyViz;
      break;
    default:
      viz = playerTeamsViz;
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
