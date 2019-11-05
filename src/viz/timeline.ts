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
  node?: d3.Selection<SVGGElement, FrozenPlayer, any, any>;
  link?: d3.Selection<SVGLineElement, Teammates, any, any>;
  pathContainer?: d3.Selection<SVGGElement, string, any, any>;
  paths?: d3.Selection<SVGPathElement, string, any, any>;
}

// Reference for groups: https://bl.ocks.org/bumbeishvili/f027f1b6664d048e894d19e54feeed42
export default class TimelineViz implements RLVisualization {
  private players: Player[];
  private currentDate = "2019-10-18";
  private playerNodes: FrozenPlayer[] = [];
  private playerLinks: Teammates[] = [];
  private fullTeams: string[];
  private selections: Selections = {};
  private simulation: d3.Simulation<FrozenPlayer, Teammates>;

  constructor(players: Player[]) {
    this.players = players;
  }

  public process = async () => {
    const teamMap: Record<string, string[]> = {};

    const lft = [];
    await Promise.all(
      _.map(
        this.players,
        player =>
          new Promise(resolve => {
            // TODO: only chooses the earlier on date changes
            const event = _.findLast(
              player.events,
              ev => this.currentDate >= ev.start && (!ev.end || this.currentDate <= ev.end),
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
    if (this.selections.node) {
      this.selections.node = this.selections.node.data(this.playerNodes, d => d.name);
      this.selections.node.exit().remove();

      this.selections.node = this.selections.node
        .enter()
        .append("g")
        .merge(this.selections.node);

      this.selections.node
        .append("circle")
        .attr("r", CIRCLE_RADIUS)
        .call(
          d3
            .drag()
            .on("start", nodeDrag.start.bind(null, this.simulation))
            .on("drag", nodeDrag.in)
            .on("end", nodeDrag.end.bind(null, this.simulation)),
        );

      this.selections.node
        .append("text")
        .attr("x", CIRCLE_RADIUS + 1)
        .attr("y", 3)
        .text((d: FrozenPlayer) => d.name);
    }

    // Links
    if (this.selections.link) {
      this.selections.link = this.selections.link.data(
        this.playerLinks,
        d => `${(d.source as FrozenPlayer).name}-${(d.target as FrozenPlayer).name}`,
      );
      this.selections.link.exit().remove();
      this.selections.link = this.selections.link
        .enter()
        .append("line")
        .attr("stroke", "black");
    }

    // Paths
    if (this.selections.pathContainer) {
      this.selections.pathContainer = this.selections.pathContainer
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
    this.selections.pathContainer = chart
      .append("g")
      .attr("id", "teams")
      .selectAll(".group-path");

    this.selections.paths = this.selections.pathContainer
      .append("path")
      .attr("stroke", "blue")
      .attr("fill", "lightblue")
      .attr("opacity", 1);

    // Nodes
    this.selections.node = chart
      .append("g")
      .attr("id", "nodes")
      .selectAll("circle");

    // Links
    this.selections.link = chart
      .append("g")
      .attr("id", "links")
      .selectAll("line");

    // Given a team name, generate the polygon for it
    const polygonGenerator = (teamName: string) => {
      const nodeCoords = this.selections
        .node!.filter((d: FrozenPlayer) => d.team === teamName)
        .data()
        .map((d: any) => [d.x, d.y]);

      return d3.polygonHull(nodeCoords as Array<[number, number]>);
    };

    const ticked = () => {
      this.selections
        .link!.attr("x1", (d: Teammates) => _.get(d, "source.x"))
        .attr("y1", (d: Teammates) => _.get(d, "source.y"))
        .attr("x2", (d: Teammates) => _.get(d, "target.x"))
        .attr("y2", (d: Teammates) => _.get(d, "target.y"));

      this.selections.node!.attr("transform", (d: any) => `translate(${d.x},${d.y})`);

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
          .pathContainer!.filter((d: any) => d === teamName)
          .attr("transform", "translate(" + centroid[0] + "," + centroid[1] + ") scale(1.2)");
      });
    };

    this.simulation.on("tick", ticked);

    // Updatable
    this.restart();
  };

  public setDate = (newDate: string) => {
    this.currentDate = newDate;

    this.process();
    this.restart();
  };
}
