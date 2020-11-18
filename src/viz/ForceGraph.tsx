import * as d3 from "d3-force";
import { scaleLinear } from "d3-scale";
import { clamp, concat, forEach, get, map, reduce } from "lodash";
import React, { useMemo, useState } from "react";
import { useUpdate } from "react-use";
import { CIRCLE_RADIUS, HEIGHT, WIDTH } from "../constants";
import { differentTeamForce, sameTeamForce } from "../forces";
import { SimulationLink, TournamentDoc, TournamentPlayerNode } from "../types";
import { getNodeId, getPlayerName, tournamentsToPlayerNodes } from "../util";

function processPlayerLinks(tournaments: TournamentDoc[]) {
  // Basically we want a full list of links with source and target both being an index 3-tuple
  const inverseMap: Record<string, TournamentPlayerNode[]> = {};
  forEach(tournaments, (tournament, tournamentIndex) => {
    forEach(tournament.teams, (team, teamIndex) => {
      // Same team + same tournament
      forEach(team.players, (player, playerIndex) => {
        if (!(player in inverseMap)) {
          inverseMap[player] = [];
        }
        inverseMap[player].push({
          playerIndex,
          teamIndex,
          tournamentIndex,
          id: getNodeId(tournamentIndex, teamIndex, playerIndex),
        });
      });
    });
  });

  // Compress inverseMap into all links
  return reduce(
    inverseMap,
    (acc, nodes) => {
      // Combine nodes into an array of links
      const links = [];
      for (let i = 0; i < nodes.length - 1; i++) {
        // Note, these nodes aren't the same as the actual nodes
        links.push({
          source: getNodeId(nodes[i].tournamentIndex, nodes[i].teamIndex, nodes[i].playerIndex),
          target: getNodeId(
            nodes[i + 1].tournamentIndex,
            nodes[i + 1].teamIndex,
            nodes[i + 1].playerIndex,
          ),
        });
      }
      return concat(acc, links);
    },
    [] as SimulationLink[],
  );
}

export default function ForceGraph({ tournaments }: { tournaments: TournamentDoc[] }) {
  const update = useUpdate();

  // drag state
  const [dragNode, setDragNode] = useState<d3.SimulationNodeDatum | null>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [start, setStart] = useState({ x: 0, y: 0 });

  // Process data
  const playerNodes = useMemo(() => tournamentsToPlayerNodes(tournaments), [tournaments]);
  const playerLinks = useMemo(() => processPlayerLinks(tournaments), [tournaments]);

  const x = scaleLinear()
    .domain([0, tournaments.length])
    .range([15 * CIRCLE_RADIUS + CIRCLE_RADIUS, WIDTH - CIRCLE_RADIUS]);

  const simulation = useMemo(
    () =>
      d3
        .forceSimulation<TournamentPlayerNode>(playerNodes)
        .force(
          "link",
          d3
            .forceLink<TournamentPlayerNode, SimulationLink>()
            .distance(WIDTH / 6) // N + 2
            .id((d) => getNodeId(d.tournamentIndex, d.teamIndex, d.playerIndex))
            .links(playerLinks),
        )
        .force("charge", d3.forceManyBody().strength(-65))
        .force("y", d3.forceY(HEIGHT / 2).strength(0.01))
        .force("collide", d3.forceCollide(CIRCLE_RADIUS + 2))
        .force("sameTeam", sameTeamForce().strength(0.8))
        .force("diffTeam", differentTeamForce().strength(15))
        .on("tick", update),
    [playerNodes, playerLinks],
  );

  // Triggered by mouse down on a node
  const handleStartDrag = (
    d: TournamentPlayerNode,
    e: React.MouseEvent<SVGElement, MouseEvent>,
  ) => {
    simulation.alphaTarget(0.3).restart();

    setDragNode(d);
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

  const handleDoneDragging = () => {
    if (dragNode) {
      simulation.alphaTarget(0);
      dragNode.fx = null;
      dragNode.fy = null;
    }
    setDragNode(null);
  };

  return (
    <svg width={WIDTH} height={HEIGHT} onMouseMove={handleDrag} onMouseUp={handleDoneDragging}>
      <g id="nodes">
        {map(playerNodes, (d) => (
          <g
            key={d.id}
            transform={`translate(${x(d.tournamentIndex)},${clamp(d.y || 0, 0, HEIGHT)})`}
            onMouseDown={handleStartDrag.bind(null, d)}
          >
            <circle r={CIRCLE_RADIUS} />
            <text x={CIRCLE_RADIUS + 1} y={3}>
              {getPlayerName(tournaments, d)}
            </text>
          </g>
        ))}
      </g>
      <g id="links">
        {map(playerLinks, (d) => (
          <line
            stroke="black"
            key={`${(d.source as TournamentPlayerNode).id}-${
              (d.target as TournamentPlayerNode).id
            }`}
            x1={x((d.source as TournamentPlayerNode).tournamentIndex)}
            y1={clamp(get(d, "source.y"), 0, HEIGHT)}
            x2={x((d.target as TournamentPlayerNode).tournamentIndex)}
            y2={clamp(get(d, "target.y"), 0, HEIGHT)}
          />
        ))}
      </g>
    </svg>
  );
}
