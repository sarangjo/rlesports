import * as d3 from "d3";
import { combination } from "js-combinatorics";
import _ from "lodash";

import { CIRCLE_RADIUS, HEIGHT, WIDTH } from "../constants";
import { Chart, RLVisualization } from "../types";
import { nodeDrag } from "../util";

import "./timeline.css";

interface PlayerEvent {
  start: string;
  team: string;
  end?: string;
  role?: string;
}

interface Player {
  name: string;
  events: PlayerEvent[];
}

interface FrozenPlayer extends d3.SimulationNodeDatum {
  name: string;
  team?: string;
}

type Team = d3.SimulationLinkDatum<FrozenPlayer>;

const CURRENT_DATE = "2019-10-18";

// Used later to set group curve
const valueline = d3
  .line()
  .x(d => d[0])
  .y(d => d[1])
  .curve(d3.curveCatmullRomClosed);

// Reference for groups: https://bl.ocks.org/bumbeishvili/f027f1b6664d048e894d19e54feeed42
export default class TimelineViz implements RLVisualization {
  private playerNodes: FrozenPlayer[] = [];
  private playerLinks: Team[] = [];
  private fullTeams: string[];

  public process = async (players: Player[]) => {
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
            const frozenPlayer: FrozenPlayer = { name: player.name };
            if (event) {
              if (!(event.team in teamMap)) {
                teamMap[event.team] = [];
              }
              teamMap[event.team].push(player.name);
              frozenPlayer.team = event.team;
            } else {
              lft.push(player.name);
            }
            this.playerNodes.push(frozenPlayer);
            resolve();
          }),
      ),
    );

    this.fullTeams = _.keys(_.pickBy(teamMap, p => p.length >= 3));

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
      .forceSimulation<FrozenPlayer>(this.playerNodes)
      .force(
        "link",
        d3
          .forceLink<FrozenPlayer, Team>()
          .id(d => d.name)
          .links(this.playerLinks),
      )
      .force("collide", d3.forceCollide(50))
      .force("x", d3.forceX(WIDTH / 2))
      .force("y", d3.forceY(HEIGHT / 2));
    // .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2).strength(1.5));

    // Teams
    const pathContainers = chart
      .append("g")
      .attr("id", "teams")
      .selectAll(".group-path")
      .data(this.fullTeams)
      .enter()
      .append("g")
      .attr("class", "group-path");

    const paths = pathContainers
      .append("path")
      .attr("stroke", "blue")
      .attr("fill", "lightblue")
      .attr("opacity", 1);

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
      .attr("x", CIRCLE_RADIUS + 1)
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

    // Given a team name, generate the polygon for it
    const polygonGenerator = (teamName: string) => {
      const nodeCoords = nodeGSelection
        .filter(d => d.team === teamName)
        .data()
        .map(d => [d.x, d.y]);

      return d3.polygonHull(nodeCoords as Array<[number, number]>);
    };

    const ticked = () => {
      linkSelection
        .attr("x1", d => _.get(d, "source.x"))
        .attr("y1", d => _.get(d, "source.y"))
        .attr("x2", d => _.get(d, "target.x"))
        .attr("y2", d => _.get(d, "target.y"));

      nodeGSelection.attr("transform", d => `translate(${d.x},${d.y})`);

      this.fullTeams.forEach(teamName => {
        let centroid: [number, number] = [0, 0];

        // Set the path
        paths
          .filter(d => d === teamName)
          .attr("transform", "scale(1) translate(0,0)")
          .attr("d", d => {
            const polygon = polygonGenerator(d);
            if (polygon) {
              centroid = d3.polygonCentroid(polygon);

              // to scale the shape properly around its points:
              // move the 'g' element to the centroid point, translate
              // all the path around the center of the 'g' and then
              // we can scale the 'g' element properly
              return valueline(
                polygon.map(point => [point[0] - centroid[0], point[1] - centroid[1]]),
              );
            }
            return null;
          });

        // Set the path container
        pathContainers
          .filter(d => d === teamName)
          .attr("transform", "translate(" + centroid[0] + "," + centroid[1] + ") scale(1.2)");
      });
    };

    simulation.on("tick", ticked);
  };
}
