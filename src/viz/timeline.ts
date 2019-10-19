import * as d3 from "d3";
import { combination } from "js-combinatorics";
import _ from "lodash";
import log from "loglevel";

import { CIRCLE_RADIUS, HEIGHT, WIDTH } from "../constants";
import { Chart, RLVisualization } from "../types";
import { nodeDrag } from "../util";

interface PlayerEvent {
  start: string;
  team: string;
  end?: string;
  role?: string;
}

interface Player extends d3.SimulationNodeDatum {
  name: string;
  events: PlayerEvent[];
}

type Team = d3.SimulationLinkDatum<Player>;

const CURRENT_DATE = "2019-10-18";

// Reference for groups: https://bl.ocks.org/bumbeishvili/f027f1b6664d048e894d19e54feeed42
export default class TimelineViz implements RLVisualization {
  private playerNodes: Player[];
  private playerLinks: Team[] = [];
  private fullTeams: string[];

  public process = async (players: Player[]) => {
    this.playerNodes = players;
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
              ev => CURRENT_DATE >= ev.start && (!ev.end || CURRENT_DATE <= ev.end),
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
    this.fullTeams = _.keys(_.filter(teamMap, ({}, p) => p.length >= 3));

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

  public draw = (chart: Chart) => {
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
      .force("collide", d3.forceCollide(20))
      .force("x", d3.forceX(WIDTH / 2))
      .force("y", d3.forceY(HEIGHT / 2));
    // .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2).strength(1.5));

    // Nodes
    const nodeGSelection = chart
      .append("g")
      .attr("id", "nodes")
      .selectAll("circle")
      .data(this.playerNodes)
      .enter()
      .append("g");

    nodeGSelection
      .append("circle")
      .attr("r", CIRCLE_RADIUS)
      .call(
        d3
          .drag()
          .on("start", nodeDrag.start.bind(null, simulation))
          .on("drag", nodeDrag.in)
          .on("end", nodeDrag.end.bind(null, simulation)),
      );

    nodeGSelection
      .append("text")
      .attr("x", 6)
      .attr("y", 3)
      .text(d => d.name);

    // Links
    const linkSelection = chart
      .append("g")
      .attr("id", "links")
      .selectAll("line")
      .data(this.playerLinks)
      .enter()
      .append("line")
      .attr("stroke", "black");

    // Teams: TODO
    /*
    const groupsSelection = chart.append("g").attr("id", "teams");
    const paths = groupsSelection
      .selectAll(".path")
      .data(this.fullTeams)
      .enter()
      .append("g")
      .attr("class", "path")
      .append("path")
      .attr("stroke", "blue")
      .attr("fill", "lightblue")
      .attr("opacity", 0);
    paths
      .transition()
      .duration(2000)
      .attr("opacity", 1);

    const polygonGenerator = groupId => {
      const nodeCoords = nodeGSelection
        .filter(d => d. === groupId)
        .data()
        .map(function(d) {
          return [d.x, d.y];
        });

      return d3.polygonHull(nodeCoords);
    };

    const updateGroups = () => {
      this.fullTeams.forEach(groupId => {
        const path = paths
          .filter(d => d == groupId)
          .attr("transform", "scale(1) translate(0,0)")
          .attr("d", d => {
            polygon = polygonGenerator(d);
            centroid = d3.polygonCentroid(polygon);

            // to scale the shape properly around its points:
            // move the 'g' element to the centroid point, translate
            // all the path around the center of the 'g' and then
            // we can scale the 'g' element properly
            return valueline(
              polygon.map(function(point) {
                return [point[0] - centroid[0], point[1] - centroid[1]];
              }),
            );
          });

        d3.select(path.node().parentNode).attr(
          "transform",
          "translate(" + centroid[0] + "," + centroid[1] + ") scale(" + scaleFactor + ")",
        );
      });
    };
    */

    const ticked = () => {
      linkSelection
        .attr("x1", d => _.get(d, "source.x"))
        .attr("y1", d => _.get(d, "source.y"))
        .attr("x2", d => _.get(d, "target.x"))
        .attr("y2", d => _.get(d, "target.y"));

      nodeGSelection.attr("transform", d => `translate(${d.x},${d.y})`);
    };

    // Tick
    simulation.on("tick", ticked);
  };
}
