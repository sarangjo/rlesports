import { SankeyLink, SankeyNode } from "d3-sankey";
import { WIDTH } from "../constants";
import { RlcsSeason } from "../types";

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

  // Algorithm:
  // - walk through each tournament
  // - for each team/player, find the previous tournament they were in
  // - if such exists, find any common teammates along the same path
  // - if any exist, bulk up the link by combining the two
};

export default function SankeyTournaments({ seasons }: { seasons: RlcsSeason[] }) {
  return <svc width={WIDTH} height={HEIGHT}></svc>;
}
