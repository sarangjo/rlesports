import { sankey, SankeyLink, sankeyLinkHorizontal, SankeyNode } from "d3-sankey";
import { find, forEach, get, map } from "lodash";
import React, { useMemo } from "react";
import { HEIGHT, WIDTH } from "../constants";
import { Tournament } from "../types";

// These properties are on top of the node and link properties Sankey provides
interface TeamNode {
  name: string;
  tournamentIndex: number;
}

interface PlayerLink {
  player: string;
}

const NONE_TEAM = "NONE";

const findTeamForPlayer = (tourney: Tournament, player: string) =>
  get(
    find(tourney.teams, (t) => find(t.players, (p) => p === player)),
    "name",
    NONE_TEAM,
  );

const getNodeId = (d: TeamNode) => `${d.name}-${d.tournamentIndex}`;

const processTournaments = (tournaments: Tournament[]) => {
  // Nodes are each team.
  // Links are players
  const nodes: Array<SankeyNode<TeamNode, PlayerLink>> = [];
  const links: Array<SankeyLink<TeamNode, PlayerLink>> = [];
  // Collect all relevant players
  const allPlayers = new Set<string>();
  forEach(tournaments, (tourney, tournamentIndex) => {
    // Add nodes for each team
    forEach(tourney.teams, (team) => {
      nodes.push({ name: team.name, tournamentIndex });
      map(team.players, (p) => allPlayers.add(p));
    });
    // Add the none
    nodes.push({ name: NONE_TEAM, tournamentIndex });
  });

  forEach(tournaments.slice(0, tournaments.length - 1), (tourney, tournamentIndex) => {
    const tournamentPlayers = new Set(allPlayers);

    // Go through each player in each team and compose source/target
    forEach(tourney.teams, (team) => {
      // First add all players that are actually here
      forEach(team.players, (player) => {
        links.push({
          source: getNodeId({ name: team.name, tournamentIndex }),
          target: getNodeId({
            name: findTeamForPlayer(tournaments[tournamentIndex + 1], player),
            tournamentIndex: tournamentIndex + 1,
          }),
          value: 1,
          player,
        });
        tournamentPlayers.delete(player);
      });
    });
    // Then all of the others
    tournamentPlayers.forEach((player) =>
      links.push({
        source: getNodeId({ name: NONE_TEAM, tournamentIndex }),
        target: getNodeId({
          name: findTeamForPlayer(tournaments[tournamentIndex + 1], player),
          tournamentIndex: tournamentIndex + 1,
        }),
        value: 1,
        player,
      }),
    );
  });

  return { nodes, links };
};

const NODE_WIDTH = 20;

// TODO hack because sankey's typedefs don't have linkSort atm
const sankeyCreator = (sankey<TeamNode, PlayerLink>()
  .size([WIDTH, HEIGHT])
  .nodeId(getNodeId)
  .nodeWidth(NODE_WIDTH)
  .nodePadding(10)
  .nodeAlign((d) => {
    return get(d, "tournamentIndex");
  })
  .nodeSort((a, b) => {
    if (a.name.startsWith(NONE_TEAM)) {
      return 1;
    } else if (b.name.startsWith(NONE_TEAM)) {
      return -1;
    } else {
      return 0;
    }
  }) as any).linkSort((a: any, b: any) => {
  return get(a, "player") - get(b, "player");
});

export default function Sankey({ tournaments }: { tournaments: Tournament[] }) {
  const data = processTournaments(tournaments); // useMemo(() => processTournaments(tournaments), [tournaments]);

  console.log(data);

  if (data.nodes.length > 0 && data.links.length > 0) {
    sankeyCreator(data);
  }

  return (
    <svg width={WIDTH} height={HEIGHT}>
      <g id="links" className="links">
        {map(data.links, (d: any) => (
          <g>
            <path
              className="link"
              d={sankeyLinkHorizontal()(d) || ""}
              fill="none"
              stroke="#606060"
              strokeWidth={d.width}
              strokeOpacity={0.5}
            >
              <title>{d.player}</title>
            </path>
            <text x={get(d, "source.x1") + 5} y={d.y0}>
              {d.player}
            </text>
            <text x={get(d, "target.x0") - 5} y={d.y1} textAnchor="end">
              {d.player}
            </text>
          </g>
        ))}
      </g>
      <g id="nodes">
        {map(data.nodes, (d) => {
          const t = {
            x: (d.x0 || 0) + NODE_WIDTH / 2,
            y: d.y1 || 0,
          };
          return (
            <g>
              <rect
                className="node"
                x={d.x0}
                y={d.y0}
                width={(d.x1 || 0) - (d.x0 || 0)}
                height={(d.y1 || 0) - (d.y0 || 0)}
                fill={d.name.startsWith(NONE_TEAM) ? "crimson" : "skyblue"}
                opacity={0.8}
              />
              <text
                fontSize={10}
                x={t.x}
                y={t.y}
                transform={`rotate(-90,${t.x},${t.y})`}
                textLength={(d.y1 || 0) - (d.y0 || 0)}
                lengthAdjust="spacing"
              >
                {d.name}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
