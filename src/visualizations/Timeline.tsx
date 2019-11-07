import { drag } from "d3-drag";
import {
  forceCollide,
  forceLink,
  forceSimulation,
  forceX,
  forceY,
  SimulationLinkDatum,
  SimulationNodeDatum,
} from "d3-force";
import { select } from "d3-selection";
import { combination } from "js-combinatorics";
import _ from "lodash";
import log from "loglevel";
import React, { Component } from "react";

import { CIRCLE_RADIUS, HEIGHT, WIDTH } from "../constants";
import { nodeDrag } from "../util";

// The name of the link force
const LINK_FORCE = "link";

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
interface Player extends SimulationNodeDatum {
  name: string;
  team?: string;
}

// We use links to ensure proximity of teammates
type Teammates = SimulationLinkDatum<Player>;

// Convenient container to hold onto all of the SVG selections used by D3
/*
interface Selections {
  node?: Selection<SVGGElement, Player, any, any>;
  link?: Selection<SVGLineElement, Teammates, any, any>;
  pathContainer?: Selection<SVGGElement, string, any, any>;
  path?: Selection<SVGPathElement, string, any, any>;
}
*/

interface Props {
  initialData: FullPlayer[];
  date: string;
}

/* Thinking area */
/*
Okay so what do we have going on here?
- The simulation is passed an array of nodes that we want to maintain; we don't want to create new
nodes every time data changes.
- However, whenever the props change, we want to propagate that by updating the team names for all
the nodes and updating links
- So let's try this out.
*/
export default class TimelineViz extends Component<Props> {
  // DOM selections
  private node: SVGSVGElement | null = null;

  public createChart = () => {};

  public componentDidMount() {
    log.debug("mounted");

    if (!this.node) {
      // can only create chart after mounting
      return;
    }
    const chart = select(this.node);

    // Simulation
    // TODO i removed passing in playerNodes and playerLinks
    const simulation = forceSimulation<Player>(playerNodes)
      .force(
        LINK_FORCE,
        forceLink<Player, Teammates>()
          .id(d => d.name)
          .links(playerLinks),
      )
      .force("collide", forceCollide(50))
      .force("x", forceX(WIDTH / 2))
      .force("y", forceY(HEIGHT / 2));

    /*
// Team bubbles (TODO)
this.selections.pathContainer = chart
  .append("g")
  .attr("id", "teams")
  .selectAll(".group-path");

this.selections.path = this.selections.pathContainer
  .append("path")
  .attr("stroke", "blue")
  .attr("fill", "lightblue")
  .attr("opacity", 1);
  */

    // Nodes: g + (circle, text)
    const nodeG = chart
      .append("g")
      .attr("id", "nodes")
      .selectAll("circle")
      .data(playerNodes)
      .enter()
      .append("g");
    nodeG
      .append("circle")
      .attr("r", CIRCLE_RADIUS)
      .call(
        // TODO fix type issues
        drag()
          .on("start", nodeDrag.start.bind(null, simulation) as any)
          .on("drag", nodeDrag.in as any)
          .on("end", nodeDrag.end.bind(null, simulation) as any) as any,
      );
    nodeG
      .append("text")
      .attr("x", CIRCLE_RADIUS + 1)
      .attr("y", 3)
      .text((d: Player) => d.name);

    // Links
    const link = chart
      .append("g")
      .attr("id", "links")
      .selectAll("line")
      .data(playerLinks)
      .enter()
      .append("line")
      .attr("stroke", "black");

    // Given a team name, generate the polygon for it
    /*
const polygonGenerator = (teamName: string) => {
const nodeCoords = nodeGSelection
  .filter(d => d.team === teamName)
  .data()
  .map(d => [d.x, d.y]);

return d3.polygonHull(nodeCoords as Array<[number, number]>);
};*/

    const ticked = () => {
      link
        .attr("x1", d => _.get(d, "source.x"))
        .attr("y1", d => _.get(d, "source.y"))
        .attr("x2", d => _.get(d, "target.x"))
        .attr("y2", d => _.get(d, "target.y"));

      nodeG.attr("transform", d => `translate(${d.x},${d.y})`);

      /*
this.fullTeams.forEach(teamName => {
  let centroid: [number, number] = [0, 0];

  // Set the path
  this.selections
    .path!.filter((d: string) => d === teamName)
    .attr("transform", "scale(1) translate(0,0)")
    .attr("d", (d: string) => {
      const polygon = polygonGenerator(d);
      if (polygon) {
        centroid = polygonCentroid(polygon);

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
*/
    };
    simulation.on("tick", ticked);
  }

  public componentDidUpdate() {
    log.debug("updated");
    // This is where we handle updates to `date` and `data`
    this.createChart();
  }

  public render() {
    return (
      <svg className="chart" ref={node => (this.node = node)} width={WIDTH} height={HEIGHT}></svg>
    );
  }

  private processData = () => {
    // Construct playerNodes and playerLinks
    const playerNodes: Player[] = this.props.initialData.map(player => ({ name: player.name }));
    const playerLinks: Teammates[] = [];
    const playerEvents = this.props.initialData.reduce((map, obj) => {
      map[obj.name] = obj.events;
      return map;
    }, {});

    // Process props
    const teamMap: Record<string, Player[]> = {};

    const lft = [];
    playerNodes.forEach(player => {
      // TODO: only chooses the earlier on date changes
      player.team = _.get(
        _.findLast(
          playerEvents[player.name],
          ev => this.props.date >= ev.start && (!ev.end || this.props.date <= ev.end),
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

    // const fullTeams = _.keys(_.pickBy(teamMap, p => p.length >= 3));

    playerLinks.length = 0;
    _.forEach(teamMap, playerNames => {
      if (playerNames.length >= 2) {
        const newLinks = combination(playerNames, 2).map(playerCombo => ({
          source: playerCombo[0],
          target: playerCombo[1],
        }));
        playerLinks.push(...newLinks);
      }
    });

    return {
      playerNodes,
      playerLinks,
    };
  };
}
