import * as _ from "lodash";
import * as log from "loglevel";
import * as d3 from "d3";
import { combination } from "js-combinatorics";

import { nodeDrag } from "../util";
import { Chart, RLVisualization } from "../types";
import { CIRCLE_RADIUS, WIDTH, HEIGHT } from "../constants";

interface PlayerEvent {
  start: string;
  team: string;
  end?: string;
  role?: string;
}

interface Player extends d3.SimulationNodeDatum {
  name: string;
  events: Array<PlayerEvent>;
}

type Team = d3.SimulationLinkDatum<Player>;

const CURRENT_DATE = "2015-07-10";

// Reference for groups: https://bl.ocks.org/bumbeishvili/f027f1b6664d048e894d19e54feeed42
export default class TimelineViz implements RLVisualization {
  private playerNodes: Player[];
  private playerLinks: Team[];

  process = async (players: Player[]) => {
    this.playerNodes = players;
    this.playerLinks = [];

    const teamMap: Record<string, string[]> = {};
    const lft = [];
    await Promise.all(
      _.map(
        players,
        player =>
          new Promise(resolve => {
            // TODO: only chooses the earlier on date changes
            const event = _.findLast(
              player.events,
              event => CURRENT_DATE >= event.start && (!event.end || CURRENT_DATE <= event.end),
            );
            if (event) {
              if (!(event.team in teamMap)) {
                teamMap[event.team] = [];
              }
              teamMap[event.team].push(player.name);
            } else {
              lft.push(player.name);
            }
            resolve();
          }),
      ),
    );

    log.debug(teamMap);

    _.forEach(teamMap, playerNames => {
      if (playerNames.length >= 2) {
        this.playerLinks = this.playerLinks.concat(
          combination(playerNames, 2).map(playerCombo => ({
            source: playerCombo[0],
            target: playerCombo[1],
          })),
        );
      }
    });
  };

  draw = (chart: Chart) => {
    // Simulation
    const simulation = d3
      .forceSimulation<Player>(this.playerNodes)
      .force(
        "link",
        d3
          .forceLink<Player, d3.SimulationLinkDatum<Player>>()
          .id(d => d.name)
          .links(this.playerLinks),
      )
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2));

    // Nodes
    const nodeGSelection = chart
      .append("g")
      .attr("id", "nodes")
      .selectAll("circle")
      .data(this.playerNodes)
      .enter()
      .append("g");

    const nodeSelection = nodeGSelection
      .append("circle")
      .attr("r", CIRCLE_RADIUS)
      .call(
        d3
          .drag()
          .on("start", nodeDrag.start.bind(null, simulation))
          .on("drag", nodeDrag.in)
          .on("end", nodeDrag.end.bind(null, simulation)),
      );

    // TODO figure this out
    /*
    nodeGSelection
      .append("text")
      .attr("x", 6)
      .attr("y", 3)
      .text(d => d.name);
    */

    // Links
    const linkSelection = chart
      .append("g")
      .attr("id", "links")
      .selectAll("line")
      .data(this.playerLinks)
      .enter()
      .append("line")
      .attr("stroke", "black");

    // Teams
    // TODO

    const ticked = () => {
      linkSelection
        .attr("x1", d => _.get(d, "source.x"))
        .attr("y1", d => _.get(d, "source.y"))
        .attr("x2", d => _.get(d, "target.x"))
        .attr("y2", d => _.get(d, "target.y"));

      nodeSelection.attr("cx", d => d.x || 0).attr("cy", d => d.y || 0);
    };

    // Tick
    simulation.on("tick", ticked);
  };
}
