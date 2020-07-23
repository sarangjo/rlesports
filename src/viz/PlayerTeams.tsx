import {
  forceCollide,
  forceLink,
  ForceLink,
  forceSimulation,
  forceX,
  forceY,
  SimulationNodeDatum,
} from "d3-force";
import { combination } from "js-combinatorics";
import { findLast, forEach, get, map } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useUpdate } from "react-use";
import { CIRCLE_RADIUS, HEIGHT, WIDTH } from "../constants";
import { LINK_FORCE } from "../util";

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
interface Player extends SimulationNodeDatum {
  name: string;
  team?: string;
}

// We use links to ensure proximity of teammates
type Teammates = d3.SimulationLinkDatum<Player>;

// For the current value of `date`, go through and assign teams to the players
const init = (players: FullPlayer[], date: string) => {
  // First set up player nodes and events
  const nodes: Player[] = [];
  const playerEvents: Record<string, PlayerEvent[]> = {};
  forEach(players, (fullPlayer) => {
    nodes.push({ name: fullPlayer.name });
    playerEvents[fullPlayer.name] = fullPlayer.events;
  });

  return { nodes, links: process(nodes, playerEvents, date), playerEvents };
};

// Update nodes, compute links
const process = (nodes: Player[], playerEvents: Record<string, PlayerEvent[]>, date: string) => {
  const teamMap: Record<string, Player[]> = {};
  const lft = [];

  // Update team
  nodes.forEach((player) => {
    // TODO: only chooses the earlier on date changes
    player.team = get(
      findLast(playerEvents[player.name], (ev) => date >= ev.start && (!ev.end || date <= ev.end)),
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

  const links: Teammates[] = [];
  forEach(teamMap, (playerNames) => {
    if (playerNames.length >= 2) {
      const newLinks = combination(playerNames, 2).map((playerCombo) => ({
        source: playerCombo[0],
        target: playerCombo[1],
      }));
      links.push(...newLinks);
    }
  });

  return links;
};

export default function PlayerTeams({ players }: { players: FullPlayer[] }) {
  const update = useUpdate();

  const [date, setDate] = useState("2021-01-01");

  // drag state
  const [dragNode, setDragNode] = useState<d3.SimulationNodeDatum | null>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [start, setStart] = useState({ x: 0, y: 0 });

  // Dependent data
  const { nodes, links, playerEvents } = useMemo(() => init(players, date), [players]);
  // Dependent simulation
  const simulation = useMemo(() => {
    console.log("creating simulation");
    return forceSimulation(nodes)
      .force(
        LINK_FORCE,
        forceLink<Player, Teammates>().id((d) => d.name),
      )
      .force("collide", forceCollide(50))
      .force("x", forceX(WIDTH / 2))
      .force("y", forceY(HEIGHT / 2))
      .on("tick", update);
  }, [nodes]);

  // on date change, update links and restart
  useEffect(() => {
    console.log("restarting simulation");

    // TODO do links really need to be in state?
    const newLinks = process(nodes, playerEvents, date);

    simulation.nodes(nodes);
    (simulation.force(LINK_FORCE) as ForceLink<Player, Teammates>).links(newLinks);
    simulation.alpha(1).restart().tick();
  }, [date]);

  // Triggered by mouse down on a node
  const handleStartDrag = (d: SimulationNodeDatum, e: React.MouseEvent<SVGElement, MouseEvent>) => {
    if (!dragNode) {
      simulation.alphaTarget(0.3).restart();
      setDragNode(d);
    }

    setOrigin({ x: e.clientX, y: e.clientY });
    setStart({ x: d.x || 0, y: d.y || 0 });

    d.fx = d.x;
    d.fy = d.y;
  };

  const handleDrag = (e: React.MouseEvent<SVGElement, MouseEvent>) => {
    if (dragNode) {
      dragNode.fx = start.x + e.clientX - origin.x;
      dragNode.fy = start.y + e.clientY - origin.y;
    }
  };

  // TODO move to window somehow
  const handleDoneDragging = () => {
    if (dragNode) {
      simulation.alphaTarget(0);
      dragNode.fx = null;
      dragNode.fy = null;
    }
    setDragNode(null);
  };

  // TODO: add polygons for full teams
  return (
    <>
      <div>
        <input value={date} type="date" onChange={(e) => setDate(e.target.value)} />
      </div>
      <svg height={HEIGHT} width={WIDTH} onMouseMove={handleDrag} onMouseUp={handleDoneDragging}>
        <g id="nodes">
          {map(nodes, (d) => (
            <g
              key={d.name}
              transform={`translate(${d.x},${d.y})`}
              onMouseDown={handleStartDrag.bind(null, d)}
            >
              <circle r={CIRCLE_RADIUS} />
              <text x={CIRCLE_RADIUS + 1} y={3}>
                {d.name}
              </text>
            </g>
          ))}
        </g>
        <g id="links">
          {map(links, (d) => (
            <line
              key={`${get(d, "source.name")}-${get(d, "target.name")}`}
              stroke="black"
              x1={get(d, "source.x")}
              y1={get(d, "source.y")}
              x2={get(d, "target.x")}
              y2={get(d, "target.y")}
            />
          ))}
        </g>
      </svg>
    </>
  );
}
