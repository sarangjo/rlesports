import { scaleLinear } from "d3-scale";
import { concat, forEach, intersection, map, reduce, size, sortBy } from "lodash";
import React from "react";
import { CIRCLE_RADIUS, HEIGHT, WIDTH } from "../constants";
import { RlcsSeason, Team, Tournament } from "../types";
import {
  getNodeId,
  getPlayerName,
  tournamentAcronym,
  TournamentLink,
  tournamentMap,
  TournamentPlayerNode,
  tournamentsToPlayerNodes,
  tournamentY,
} from "../util/tournaments";

// Based on adjacent tournaments, shuffle teams so that teams with more shared players are
// vertically close together. Without this, a simple timeline is chaos. This basically brings us to
// a healthy midpoint between plain timeline and a Sankey.
const sort = (tournaments: Tournament[]): Tournament[] => {
  return map(tournaments, (tournament, index) => {
    if (index === 0) {
      return tournament;
    }

    const prevTourn = tournaments[index - 1];

    let overflowIndex = size(prevTourn.teams);

    // Pair of original index (0-based) and new index (1-based)
    const indexPairs = map(tournament.teams, (team, teamIndex) => {
      let newIndex =
        reduce(
          prevTourn.teams,
          (acc, prevTeam, prevTeamIndex) => {
            // Here if size == 0, we should return the overflowIndex, yeah?
            return acc + (prevTeamIndex + 1) * size(intersection(prevTeam.players, team.players));
          },
          0,
        ) / size(team.players);

      if (newIndex === 0) {
        newIndex = overflowIndex++;
      }
      return {
        originalIndex: teamIndex,
        newIndex,
      };
    });

    const sortedIndexPairs = sortBy(indexPairs, ["newIndex"]);

    const newTeams: Team[] = [];

    forEach(sortedIndexPairs, (pair) => {
      newTeams.push({
        ...tournament.teams[pair.originalIndex],
        metadata: JSON.stringify(pair),
      });
    });

    tournament.teams = newTeams;

    return tournament;
  });
};

const process = (t: Tournament[]): { nodes: TournamentPlayerNode[]; links: TournamentLink[] } => {
  const tournaments = sort(t);

  // First, collect all nodes for all tournaments
  const allNodes = tournamentsToPlayerNodes(t);

  // Basically we want a full list of links with source and target both being an index 3-tuple
  const inverseMap: Record<string, TournamentPlayerNode[]> = {};
  forEach(tournaments, (tournament, tournamentIndex) => {
    forEach(tournament.teams, (team, teamIndex) => {
      // // Same team + same tournament TODO uncomment eventually
      // sameTeamSameTournamentLinks.push(
      //   ...comb.combination(range(team.players.length), 2).map((pair) => ({
      //     source: getNodeId(tournamentIndex, teamIndex, pair[0]),
      //     target: getNodeId(tournamentIndex, teamIndex, pair[1]),
      //   })),
      // );

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
  const samePlayerLinks = reduce(
    inverseMap,
    (acc, nodes) => {
      // Combine nodes into an array of links
      const links = [];
      for (let i = 0; i < nodes.length - 1; i++) {
        links.push({
          source: nodes[i], // getNodeId(nodes[i].tournamentIndex, nodes[i].teamIndex, nodes[i].playerIndex),
          target: nodes[i + 1], // getNodeId( nodes[i + 1].tournamentIndex, nodes[i + 1].teamIndex, nodes[i + 1].playerIndex,),
        });
      }
      return concat(acc, links);
    },
    [] as TournamentLink[],
  );

  // allTeams = reduce(
  //   tournaments,
  //   (acc, tournament, tournamentIndex) =>
  //     concat(
  //       acc,
  //       map(tournament.teams, (team) => ({ ...team, tournamentIndex })),
  //     ),
  //   [],
  // );

  return { nodes: allNodes, links: samePlayerLinks };
};

const randDiv = () => 0.5; // Math.random() * 0.6 + 0.2;

export default function SimpleGraph({ seasons }: { seasons: RlcsSeason[] }) {
  const tournaments = tournamentMap(seasons, (t) => t);

  const x = scaleLinear()
    .domain([0, tournaments.length])
    .range([15 * CIRCLE_RADIUS + CIRCLE_RADIUS, WIDTH - CIRCLE_RADIUS]);

  const getD = (d: TournamentLink) => {
    const sx = x(d.source.tournamentIndex);
    const sy = tournamentY(d.source);
    const tx = x(d.target.tournamentIndex);
    const ty = tournamentY(d.target);

    const xmid = sx + (tx - sx) * randDiv();
    const ymid = sy + (ty - sy) * randDiv();

    return `M ${sx} ${sy} C ${xmid} ${sy}, ${xmid} ${sy}, ${xmid} ${ymid} S ${xmid} ${ty}, ${tx} ${ty}`;
  };

  const data = process(tournaments);

  return (
    <svg width={WIDTH} height={HEIGHT}>
      <g id="nodes">
        {map(data.nodes, (d) => (
          <g key={d.id}>
            <circle cx={x(d.tournamentIndex)} cy={tournamentY(d)} r={CIRCLE_RADIUS} />
            <text
              textAnchor="end"
              x={x(d.tournamentIndex) - CIRCLE_RADIUS - CIRCLE_RADIUS / 2}
              y={tournamentY(d) + CIRCLE_RADIUS / 2}
            >
              {getPlayerName(tournaments, d)}
            </text>
          </g>
        ))}
      </g>
      <g id="links">
        {map(data.links, (d) => (
          <path
            key={`${d.source.id}-${d.target.id}`}
            d={getD(d)}
            fill="transparent"
            stroke="black"
          />
        ))}
      </g>
      <g id="tournament-titles">
        {map(tournaments, (t, i) => (
          <text x={x(i)} y="1em" textAnchor="middle" key={i}>
            {tournamentAcronym(t.name)}
          </text>
        ))}
      </g>
    </svg>
  );
}
