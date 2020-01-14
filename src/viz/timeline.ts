import * as d3 from "d3";
import { combination } from "js-combinatorics";
import _ from "lodash";

import { CIRCLE_RADIUS, HEIGHT, WIDTH } from "../constants";
import { Chart, RLVisualization } from "../types";
import { nodeDrag, valueline } from "../util";

import "./timeline.css";

// Events as read in from the JSON
interface PlayerEvent {
  start: string;
  team: string;
  end?: string;
  role?: string;
}

// Each player has a full list of their events
interface FullPlayer {
  name: string;
  events: PlayerEvent[];
}

// The translated Player node which stays fixed, with the team changing based on the date chosen
interface Player extends d3.SimulationNodeDatum {
  name: string;
  team?: string;
}

// We use links to ensure proximity of teammates
type Teammates = d3.SimulationLinkDatum<Player>;

// Convenient container to hold onto all of the SVG selections used by D3
interface Selections {
  node?: d3.Selection<SVGGElement, Player, any, any>;
  link?: d3.Selection<SVGLineElement, Teammates, any, any>;
  pathContainer?: d3.Selection<SVGGElement, string, any, any>;
  path?: d3.Selection<SVGPathElement, string, any, any>;
}

const LINK_FORCE = "link";

// Reference for groups: https://bl.ocks.org/bumbeishvili/f027f1b6664d048e894d19e54feeed42
export default class TimelineViz implements RLVisualization {
  // User-selected date
  private currentDate = "2019-10-18";
  // Easy access to array of events for given player
  private playerEvents: Record<string, PlayerEvent[]>;
  // Node-link data points
  private playerNodes: Player[];
  private playerLinks: Teammates[] = [];
  // Used to determine where to draw the team bubbles (we don't want bubbles for incomplete teams
  private fullTeams: string[];
  // Simulation pieces
  private selections: Selections = {};
  private simulation: d3.Simulation<Player, Teammates>;

  ////// SETUP FUNCTIONS //////

  public draw = (chart: Chart) => {
    // UI
    const uiArea = document.getElementById("ui-area");
    if (!uiArea) {
      return;
    }

    const date = document.createElement("input");
    date.setAttribute("value", "2021-01-01");
    date.setAttribute("type", "date");

    const button = document.createElement("button");
    button.appendChild(document.createTextNode("Go"));
    button.addEventListener("click", () => this.setDate((date as HTMLInputElement).value));

    uiArea.appendChild(date);
    uiArea.appendChild(button);

    // Simulation
    this.simulation = d3
      .forceSimulation<Player>(this.playerNodes)
      .force(
        LINK_FORCE,
        d3
          .forceLink<Player, Teammates>()
          .id(d => d.name)
          .links(this.playerLinks),
      )
      .force("collide", d3.forceCollide(50))
      .force("x", d3.forceX(WIDTH / 2))
      .force("y", d3.forceY(HEIGHT / 2));
    // .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2).strength(1.5));

    // Team bubbles
    this.selections.pathContainer = chart
      .append("g")
      .attr("id", "teams")
      .selectAll(".group-path");

    this.selections.path = this.selections.pathContainer
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
        .node!.filter((d: Player) => d.team === teamName)
        .data()
        .map((d: any) => [d.x, d.y]);

      return d3.polygonHull(nodeCoords as Array<[number, number]>);
    };

    const ticked = () => {
      this.selections
        .link!.attr("x1", d => _.get(d, "source.x"))
        .attr("y1", d => _.get(d, "source.y"))
        .attr("x2", d => _.get(d, "target.x"))
        .attr("y2", d => _.get(d, "target.y"));

      this.selections.node!.attr("transform", d => `translate(${d.x},${d.y})`);

      this.fullTeams.forEach(teamName => {
        let centroid: [number, number] = [0, 0];

        // Set the path
        this.selections
          .path!.filter((d: string) => d === teamName)
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
  };

  ////// UPDATE FUNCTIONS //////

  // For the current value of `currentDate`, go through and assign teams to the players
  public process = async () => {
    const teamMap: Record<string, Player[]> = {};

    const lft = [];
    this.playerNodes.forEach(player => {
      // TODO: only chooses the earlier on date changes
      player.team = _.get(
        _.findLast(
          this.playerEvents[player.name],
          ev => this.currentDate >= ev.start && (!ev.end || this.currentDate <= ev.end),
        ),
        "team",
      );
      if (player.team) {
        if (!(player.team in teamMap)) {
          teamMap[player.team] = [];
        }
        teamMap[player.team].push(player);
      } else {
        lft.push(player);
      }
    });

    this.fullTeams = _.keys(_.pickBy(teamMap, p => p.length >= 3));

    this.playerLinks.length = 0;
    _.forEach(teamMap, playerNames => {
      if (playerNames.length >= 2) {
        const newLinks = combination(playerNames, 2).map(playerCombo => ({
          source: playerCombo[0],
          target: playerCombo[1],
        }));
        this.playerLinks.push(...newLinks);
      }
    });
  };

  // Update pattern: data, exit, enter + merge
  public restart = () => {
    // Nodes
    if (this.selections.node) {
      this.selections.node = this.selections.node.data(this.playerNodes, d => d.name);
      this.selections.node.exit().remove();
      this.selections.node = this.selections.node
        .enter()
        .append("g")
        .merge(this.selections.node);

      // Extra: two components per node
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
        .text((d: Player) => d.name);
    }

    // Links
    if (this.selections.link) {
      this.selections.link = this.selections.link.data(
        this.playerLinks,
        d => `${(d.source as Player).name}-${(d.target as Player).name}`,
      );
      this.selections.link.exit().remove();
      this.selections.link = this.selections.link
        .enter()
        .append("line")
        .attr("stroke", "black")
        .merge(this.selections.link);
    }

    // Paths
    // TODO needs update pattern
    if (this.selections.pathContainer) {
      this.selections.pathContainer = this.selections.pathContainer
        .data(this.fullTeams)
        .enter()
        .append("g")
        .attr("class", "group-path");
    }

    // Restart simulation
    this.simulation.nodes(this.playerNodes);
    const linkForce = this.simulation.force(LINK_FORCE);
    if (linkForce) {
      (linkForce as d3.ForceLink<Player, Teammates>).links(this.playerLinks);
    }
    this.simulation.restart();
  };

  public setDate = (newDate: string) => {
    this.currentDate = newDate;

    this.process();
    this.restart();
  };

  public main = (players: FullPlayer[], chart: Chart) => {
    // Set up initial values for player nodes
    this.playerNodes = players.map(player => ({ name: player.name }));
    this.playerEvents = players.reduce((map, obj) => {
      map[obj.name] = obj.events;
      return map;
    }, {});

    // Draw chart
    this.draw(chart);

    this.process();
    this.restart();
  };
}
