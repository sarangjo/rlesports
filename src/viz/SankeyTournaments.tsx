import { SankeyLink, SankeyNode } from "d3-sankey";
import React from "react";
import { HEIGHT, WIDTH } from "../constants";
import { RlcsSeason } from "../types";
import { tournamentMap } from "../util/tournaments";

interface TournamentNode {
  name: string;
  date?: string;
}

interface PlayersLink {
  players: string[];
}

// Precondition: seasons are in time order
const processSeasons2 = (seasons: RlcsSeason[]) => {
  // Idea 2:
  // 2-pass approach. In the first pass, create player histories by tournament + team.
  const playerTimelines: Record<string, { tournament: string }[]> = {};
  tournamentMap(seasons, (tourney) => {
    tourney.teams.forEach((team) => {
      team.players.forEach((p) => {
        if (!(p in playerTimelines)) {
          playerTimelines[p] = [];
        }

        playerTimelines[p].push({
          tournament: tourney.name,
        });
      });
    });
  });

  // In the second pass, convert any possible ones to team links.
  const links = [];
  for (const player in playerTimelines) {
  }
};

const processSeasons1 = (seasons: RlcsSeason[]) => {
  // Nodes are tournaments or players. Player nodes are for when a player enters or leaves the viz
  // Links are players or teams
  const nodes: Array<SankeyNode<TournamentNode, PlayersLink>> = [];
  const links: Array<SankeyLink<TournamentNode, PlayersLink>> = [];

  const lastPlayerTournament: Record<string, { name: string; team: string }> = {};

  // Algorithm:
  // - walk through each tournament in time order
  tournamentMap(seasons, (t) => {
    t.teams.forEach((team) => {
      team.players.forEach((p) => {
        // - for each player, find the previous tournament they were in
        if (p in lastPlayerTournament) {
          // - if such exists, find any common teammates along the same path
          // - if any exist, bulk up the link by combining the two
          if (
            team.players.some((otherP) => {
              if (
                otherP !== p &&
                otherP in lastPlayerTournament &&
                lastPlayerTournament[otherP].team === lastPlayerTournament[p].team
              ) {
                return true;
              }
            })
          ) {
          } else {
            links.push({
              players: [p],
              source: lastPlayerTournament[p].name,
              target: t.name,
              value: 1,
            });
          }
        }
        lastPlayerTournament[p] = { name: t.name, team: team.name };
      });
    });
  });
};

export default function SankeyTournaments({ seasons }: { seasons: RlcsSeason[] }) {
  return <svg width={WIDTH} height={HEIGHT}></svg>;
}
