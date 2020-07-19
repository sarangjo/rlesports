import { select } from "d3-selection";
import log from "loglevel";
import { HEIGHT, WIDTH } from "./constants";
import { RLVisualization, Chart } from "./types";
import playerTeamsViz from "./viz/playerTeams";
import sankeyViz from "./viz/sankey";
import simpleViz from "./viz/simple";
import forceGraphViz from "./viz/forceGraph";
import { forEach } from "lodash";
import { differentTeamForce } from "./forces";

log.setLevel("debug");

let viz: RLVisualization;
const chart = <Chart>(select("svg").attr("width", WIDTH).attr("height", HEIGHT) as any);

// Removes all elements in the view
function clear() {
  chart.selectAll("*").remove();
  const uiArea = document.getElementById("ui-area");
  while (uiArea && uiArea.firstChild) {
    uiArea.removeChild(uiArea.lastChild!);
  }
}

async function setView(view: string) {
  clear();

  switch (view) {
    case Viz.SANKEY:
      viz = sankeyViz;
      break;
    case Viz.TEAM_MAP:
      viz = playerTeamsViz;
      break;
    case Viz.FORCE_GRAPH:
      viz = forceGraphViz;
      break;
    default:
      viz = simpleViz;
      break;
  }

  await viz.main(chart);
}

enum Viz {
  SANKEY = "sankey",
  TEAM_MAP = "team-map",
  FORCE_GRAPH = "force-graph",
  SIMPLE = "simple",
}

const VizTitle = {
  [Viz.SANKEY]: "Sankey",
  [Viz.TEAM_MAP]: "Team Map",
  [Viz.FORCE_GRAPH]: "Force Graph",
  [Viz.SIMPLE]: "Simple",
};

const vizSelect = <HTMLSelectElement>document.getElementById("viz");

if (vizSelect) {
  // Init
  forEach(Viz, (x) => {
    const opt = document.createElement("option");
    opt.value = x;
    opt.text = VizTitle[x];
    vizSelect.appendChild(opt);
  });

  vizSelect.addEventListener("change", () => {
    setView(vizSelect.value);
  });

  // First value
  const initialValue = Viz.FORCE_GRAPH;
  vizSelect.value = initialValue;
  vizSelect.dispatchEvent(new Event("change"));
}

// Test area
const force = differentTeamForce();

const nodes = [
  { tournamentIndex: 0, teamIndex: 0, playerIndex: 0, y: 15, id: "" },
  { tournamentIndex: 0, teamIndex: 1, playerIndex: 1, y: 20, id: "" },
  { tournamentIndex: 0, teamIndex: 2, playerIndex: 2, y: 22, id: "" },
];
force.initialize(nodes);
force(1);
log.debug(nodes);
