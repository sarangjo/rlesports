import * as d3 from "d3";
import { combination } from "js-combinatorics";
import _ from "lodash";

import { CIRCLE_RADIUS, HEIGHT, WIDTH } from "../constants";
import players from "../data/players.json";
import { Chart, RLVisualization } from "../types";
import { nodeDrag, valueline } from "../util";

import "./playerTeams.css";

// Events as read in from the JSON
interface PlayerEvent {
  start: string;
  team: string;
  end?: string;
  role?: string;
}

// Each player has a full list of their events
export interface FullPlayer {
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

const DATE_INPUT = "date-input";
const DATE_INPUT_BUTTON = "date-input-button";

// User-selected date
let currentDate = "2019-10-18";
// Easy access to array of events for given player
let playerEvents: Record<string, PlayerEvent[]>;
// Node-link data points
let playerNodes: Player[];
const playerLinks: Teammates[] = [];
// Used to determine where to draw the team bubbles (we don't want bubbles for incomplete teams
let fullTeams: string[];
// Simulation pieces
const selections: Selections = {};
let simulation: d3.Simulation<Player, Teammates>;

// TODO not great, should be explicit
type PlayerTeamsViz = RLVisualization & Record<string, any>;

// Reference for groups: https://bl.ocks.org/bumbeishvili/f027f1b6664d048e894d19e54feeed42
const playerTeamsViz: PlayerTeamsViz = {
  ////// SETUP FUNCTIONS //////

  draw: (chart: Chart) => {
    // UI
    const uiArea = document.getElementById("ui-area");
    if (!uiArea) {
      return;
    }

    let date = document.getElementById(DATE_INPUT);
    if (!date) {
      date = document.createElement("input");
      date.setAttribute("value", "2021-01-01");
      date.setAttribute("type", "date");
      uiArea.appendChild(date);
    }

    let button = document.getElementById(DATE_INPUT_BUTTON);
    if (!button) {
      button = document.createElement("button");
      button.appendChild(document.createTextNode("Go"));
      button.addEventListener("click", () =>
        playerTeamsViz.setDate((date as HTMLInputElement).value),
      );
      uiArea.appendChild(button);
    }

    // Simulation
    simulation = d3
      .forceSimulation<Player>(playerNodes)
      .force(
        LINK_FORCE,
        d3
          .forceLink<Player, Teammates>()
          .id((d) => d.name)
          .links(playerLinks),
      )
      .force("collide", d3.forceCollide(50))
      .force("x", d3.forceX(WIDTH / 2))
      .force("y", d3.forceY(HEIGHT / 2));
    // .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2).strength(1.5));

    // Team bubbles
    selections.pathContainer = chart.append("g").attr("id", "teams").selectAll(".group-path");

    selections.path = selections.pathContainer
      .append("path")
      .attr("stroke", "blue")
      .attr("fill", "lightblue")
      .attr("opacity", 1);

    // Nodes
    selections.node = chart.append("g").attr("id", "nodes").selectAll("circle");

    // Links
    selections.link = chart.append("g").attr("id", "links").selectAll("line");

    // Given a team name, generate the polygon for it
    const polygonGenerator = (teamName: string) => {
      const nodeCoords = selections
        .node!.filter((d: Player) => d.team === teamName)
        .data()
        .map((d: any) => [d.x, d.y]);

      return d3.polygonHull(nodeCoords as Array<[number, number]>);
    };

    const ticked = () => {
      selections
        .link!.attr("x1", (d) => _.get(d, "source.x"))
        .attr("y1", (d) => _.get(d, "source.y"))
        .attr("x2", (d) => _.get(d, "target.x"))
        .attr("y2", (d) => _.get(d, "target.y"));

      selections.node!.attr("transform", (d) => `translate(${d.x},${d.y})`);

      fullTeams.forEach((teamName) => {
        let centroid: [number, number] = [0, 0];

        // Set the path
        selections
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
                polygon.map((point) => [point[0] - centroid[0], point[1] - centroid[1]]),
              );
            }
            return null;
          });

        // Set the path container
        selections
          .pathContainer!.filter((d: any) => d === teamName)
          .attr("transform", "translate(" + centroid[0] + "," + centroid[1] + ") scale(1.2)");
      });
    };

    simulation.on("tick", ticked);
  },

  ////// UPDATE FUNCTIONS //////

  // For the current value of `currentDate`, go through and assign teams to the players
  process: async () => {
    const teamMap: Record<string, Player[]> = {};

    const lft = [];
    playerNodes.forEach((player) => {
      // TODO: only chooses the earlier on date changes
      player.team = _.get(
        _.findLast(
          playerEvents[player.name],
          (ev) => currentDate >= ev.start && (!ev.end || currentDate <= ev.end),
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

    fullTeams = _.keys(_.pickBy(teamMap, (p) => p.length >= 3));

    playerLinks.length = 0;
    _.forEach(teamMap, (playerNames) => {
      if (playerNames.length >= 2) {
        const newLinks = combination(playerNames, 2).map((playerCombo) => ({
          source: playerCombo[0],
          target: playerCombo[1],
        }));
        playerLinks.push(...newLinks);
      }
    });
  },

  // Update pattern: data, exit, enter + merge
  restart: () => {
    // Nodes
    if (selections.node) {
      selections.node = selections.node.data(playerNodes, (d) => d.name);
      selections.node.exit().remove();
      selections.node = selections.node.enter().append("g").merge(selections.node);

      // Extra: two components per node
      selections.node
        .append("circle")
        .attr("r", CIRCLE_RADIUS)
        .call(
          d3
            .drag()
            .on("start", nodeDrag.start.bind(null, simulation))
            .on("drag", nodeDrag.in)
            .on("end", nodeDrag.end.bind(null, simulation)),
        );
      selections.node
        .append("text")
        .attr("x", CIRCLE_RADIUS + 1)
        .attr("y", 3)
        .text((d: Player) => d.name);
    }

    // Links
    if (selections.link) {
      selections.link = selections.link.data(
        playerLinks,
        (d) => `${(d.source as Player).name}-${(d.target as Player).name}`,
      );
      selections.link.exit().remove();
      selections.link = selections.link
        .enter()
        .append("line")
        .attr("stroke", "black")
        .merge(selections.link);
    }

    // Paths
    // TODO needs update pattern
    if (selections.pathContainer) {
      selections.pathContainer = selections.pathContainer
        .data(fullTeams)
        .enter()
        .append("g")
        .attr("class", "group-path");
    }

    // Restart simulation
    simulation.nodes(playerNodes);
    const linkForce = simulation.force(LINK_FORCE);
    if (linkForce) {
      (linkForce as d3.ForceLink<Player, Teammates>).links(playerLinks);
    }
    simulation.restart();
  },

  setDate: (newDate: string) => {
    currentDate = newDate;

    playerTeamsViz.process();
    playerTeamsViz.restart();
  },

  main: (chart: Chart) => {
    // Set up initial values for player nodes
    playerNodes = players.map((player) => ({ name: player.name }));
    playerEvents = players.reduce((map, obj) => {
      map[obj.name] = obj.events;
      return map;
    }, {});

    // Draw chart
    playerTeamsViz.draw(chart);

    playerTeamsViz.process();
    playerTeamsViz.restart();
  },
};

export default playerTeamsViz;
