import { select } from "d3-selection";
import log from "loglevel";

import { HEIGHT, WIDTH } from "./constants";
import { RLVisualization } from "./types";
// import Simple from "./viz/simple";
import Timeline from "./viz/timeline";

// import data from "./data/tournaments.json";
import data from "./data/players.json";

log.setLevel("debug");

const viz: RLVisualization = new Timeline();

viz.main(
  data,
  select("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT),
);

const button = document.getElementById("date-button");
const date = document.getElementById("date");
if (button && date) {
  log.debug(button);
  button.addEventListener("click", () => {
    const newDate = (date as HTMLInputElement).value;
    log.debug(newDate);
    (viz as Timeline).setDate(newDate);
  });
}
