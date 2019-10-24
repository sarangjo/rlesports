import * as d3 from "d3";
import { combination } from "js-combinatorics";
import _ from "lodash";

import { CIRCLE_RADIUS, HEIGHT, WIDTH } from "../constants";
import { Chart, RLVisualization } from "../types";
import { nodeDrag, valueline } from "../util";

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

type Teammates = d3.SimulationLinkDatum<FrozenPlayer>;

interface Selections {
  nodeGSelection?: d3.Selection<SVGGElement, FrozenPlayer, any, any>;
  linkSelection?: d3.Selection<SVGLineElement, Teammates, any, any>;
  pathContainers?: d3.Selection<SVGGElement, string, any, any>;
  paths?: d3.Selection<SVGPathElement, string, any, any>;
}

const CURRENT_DATE = "2019-10-18";

// Reference for groups: https://bl.ocks.org/bumbeishvili/f027f1b6664d048e894d19e54feeed42
export default class TimelineViz implements RLVisualization {
  private playerNodes: FrozenPlayer[] = [];
  private playerLinks: Teammates[] = [];
  private fullTeams: string[];
  private selections: Selections = {};
  private simulation: d3.Simulation<FrozenPlayer, Teammates>;

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

  // Update pattern
  public restart = () => {
    // Nodes
    if (this.selections.nodeGSelection) {
      this.selections.nodeGSelection = this.selections.nodeGSelection
        .data(this.playerNodes, d => d.name)
        .enter()
        .append("g");

      this.selections.nodeGSelection
        .append("circle")
        .attr("r", CIRCLE_RADIUS)
        .call(
          d3
            .drag()
            .on("start", nodeDrag.start.bind(null, this.simulation))
            .on("drag", nodeDrag.in)
            .on("end", nodeDrag.end.bind(null, this.simulation)),
        );

      this.selections.nodeGSelection
        .append("text")
        .attr("x", CIRCLE_RADIUS + 1)
        .attr("y", 3)
        .text((d: FrozenPlayer) => d.name);
    }

    // Links
    if (this.selections.linkSelection) {
      this.selections.linkSelection = this.selections.linkSelection
        .data(this.playerLinks)
        .enter()
        .append("line")
        .attr("stroke", "black");
    }

    // Paths
    if (this.selections.pathContainers) {
      this.selections.pathContainers = this.selections.pathContainers
        .data(this.fullTeams)
        .enter()
        .append("g")
        .attr("class", "group-path");
    }
  };

  public draw = (chart: Chart) => {
    // Simulation
    this.simulation = d3
      .forceSimulation<FrozenPlayer>(this.playerNodes)
      .force(
        "link",
        d3
          .forceLink<FrozenPlayer, Teammates>()
          .id(d => d.name)
          .links(this.playerLinks),
      )
      .force("collide", d3.forceCollide(50))
      .force("x", d3.forceX(WIDTH / 2))
      .force("y", d3.forceY(HEIGHT / 2));
    // .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2).strength(1.5));

    // Teams
    this.selections.pathContainers = chart
      .append("g")
      .attr("id", "teams")
      .selectAll(".group-path");

    this.selections.paths = this.selections.pathContainers
      .append("path")
      .attr("stroke", "blue")
      .attr("fill", "lightblue")
      .attr("opacity", 1);

    // Nodes
    this.selections.nodeGSelection = chart
      .append("g")
      .attr("id", "nodes")
      .selectAll("circle");

    // Links
    this.selections.linkSelection = chart
      .append("g")
      .attr("id", "links")
      .selectAll("line");

    // Misc
    chart.append("text").text(`Date: ${CURRENT_DATE}`);

    // Given a team name, generate the polygon for it
    const polygonGenerator = (teamName: string) => {
      const nodeCoords = this.selections
        .nodeGSelection!.filter((d: FrozenPlayer) => d.team === teamName)
        .data()
        .map((d: any) => [d.x, d.y]);

      return d3.polygonHull(nodeCoords as Array<[number, number]>);
    };

    const ticked = () => {
      this.selections
        .linkSelection!.attr("x1", (d: Teammates) => _.get(d, "source.x"))
        .attr("y1", (d: Teammates) => _.get(d, "source.y"))
        .attr("x2", (d: Teammates) => _.get(d, "target.x"))
        .attr("y2", (d: Teammates) => _.get(d, "target.y"));

      this.selections.nodeGSelection!.attr("transform", (d: any) => `translate(${d.x},${d.y})`);

      this.fullTeams.forEach(teamName => {
        let centroid: [number, number] = [0, 0];

        // Set the path
        this.selections
          .paths!.filter((d: string) => d === teamName)
          .attr("transform", "scale(1) translate(0,0)")
          .attr("d", (d: string) => {
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
        this.selections
          .pathContainers!.filter((d: any) => d === teamName)
          .attr("transform", "translate(" + centroid[0] + "," + centroid[1] + ") scale(1.2)");
      });
    };

    this.simulation.on("tick", ticked);

    // Updatable
    this.restart();
  };
}
