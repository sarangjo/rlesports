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

const processSeasons = (seasons: RlcsSeason[]) => {
  // Nodes are tournaments.
  // Links are players or teams
  const nodes: Array<SankeyNode<TournamentNode, PlayersLink>> = [];
  const links: Array<SankeyLink<TournamentNode, PlayersLink>> = [];

  const lastPlayerTournament: Record<string, string> = {};

  // Algorithm:
  // - walk through each tournament in time order
  tournamentMap(seasons, (t) => {
    nodes.push({
      name: t.name,
      date: t.start,
    });

    t.teams.forEach((team) => {
      team.players.forEach((p) => {
        // - for each player, find the previous tournament they were in
        if (p in lastPlayerTournament) {
          // - if such exists, find any common teammates along the same path
          // - if any exist, bulk up the link by combining the two
        }
        lastPlayerTournament[p] = t.name;
      });
    });
  });
};

export default function SankeyTournaments({ seasons }: { seasons: RlcsSeason[] }) {
  return <svg width={WIDTH} height={HEIGHT}></svg>;
}
