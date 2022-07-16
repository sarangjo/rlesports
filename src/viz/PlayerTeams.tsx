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
import { Membership, Player } from "../types";
import { LINK_FORCE } from "../util";

// The translated Player node which stays fixed, with the team changing based on the date chosen
interface PlayerNode extends SimulationNodeDatum {
  name: string;
  team?: string;
}

// We use links to ensure proximity of teammates
type Teammates = d3.SimulationLinkDatum<PlayerNode>;

// For the current value of `date`, go through and assign teams to the players
const init = (players: Player[], date: string) => {
  // First set up player nodes and events
  const nodes: PlayerNode[] = [];
  const playerEvents: Record<string, Membership[]> = {};
  forEach(players, (fullPlayer) => {
    nodes.push({ name: fullPlayer.name });
    playerEvents[fullPlayer.name] = fullPlayer.memberships;
  });

  return { nodes, links: process(nodes, playerEvents, date), playerEvents };
};

// Update nodes, compute links
const process = (nodes: PlayerNode[], playerEvents: Record<string, Membership[]>, date: string) => {
  const teamMap: Record<string, PlayerNode[]> = {};
  const lft = [];

  // Update team
  nodes.forEach((player) => {
    // TODO: only chooses the earlier on date changes
    player.team = get(
      findLast(
        playerEvents[player.name],
        (ev) => date >= ev.join && (!ev.leave || date <= ev.leave),
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

const INITIAL_DATE = "2021-01-01";

export default function PlayerTeams({ players }: { players: Player[] }) {
  const update = useUpdate();

  const [date, setDate] = useState(INITIAL_DATE);

  // drag state
  const [dragNode, setDragNode] = useState<d3.SimulationNodeDatum | null>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [start, setStart] = useState({ x: 0, y: 0 });

  // Dependent data
  const { nodes, links, playerEvents } = useMemo(() => init(players, INITIAL_DATE), [players]);
  // Dependent simulation
  const simulation = useMemo(() => {
    console.log("creating simulation");
    return forceSimulation(nodes)
      .force(
        LINK_FORCE,
        forceLink<PlayerNode, Teammates>().id((d) => d.name),
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
    (simulation.force(LINK_FORCE) as ForceLink<PlayerNode, Teammates>).links(newLinks);
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
