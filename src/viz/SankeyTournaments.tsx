import { SankeyLink, SankeyNode } from "d3-sankey";
import { forEach, intersection } from "lodash";
import React from "react";
import { HEIGHT, WIDTH } from "../constants";
import { RlcsSeason, Tournament } from "../types";
import { tournamentMap } from "../util/tournaments";

interface TournamentNode {
  name: string;
  date?: string;
}

interface PlayersLink {
  players: string[];
}

// Precondition: seasons are in time order
export const processSeasons2 = (seasons: RlcsSeason[]) => {
  const tournaments: Record<string, Tournament> = {};

  // Idea 2:
  // 2-pass approach. In the first pass, create player histories by tournament + team.
  const playerTimelines: Record<string, string[]> = {};
  tournamentMap(seasons, (tourney) => {
    tourney.teams.forEach((team) => {
      team.players.forEach((p) => {
        if (!(p in playerTimelines)) {
          playerTimelines[p] = [];
        }

        playerTimelines[p].push(tourney.name);
      });
    });

    tournaments[tourney.name] = tourney;
  });

  // We're building a graph, represented as a list of nodes, with each node having a map of outgoing links to other nodes.
  const nodes = tournamentMap(seasons, (tourney) => {
    // Alright, we're working on outgoing links from this node. The key is the next tournament and the value is a list of links.
    // Each link is a list of players.
    const node = {
      name: tourney.name,
      links: {} as Record<string, string[][]>,
    };

    tourney.teams.forEach((team) => {
      team.players.forEach((p) => {
        // Find the event in this player's history
        const eventIndex = playerTimelines[p].findIndex((ev) => ev === tourney.name);
        if (eventIndex < 0) {
          throw new Error("Couldn't find player event... something's wrong.");
        }

        if (eventIndex === playerTimelines[p].length - 1) {
          // End of the road for this player, gg.
          // FIXME solo player nodes
          return;
        }

        // Next tournament that we need to create the link to
        const thisPlayersNextTourney = playerTimelines[p][eventIndex + 1];

        // Which teammates stuck with this player for the next tourney?
        const thisPlayersNextTourneyTeam = tournaments[thisPlayersNextTourney].teams.find(t => t.players.find(otherP => otherP === p));
        if (!thisPlayersNextTourneyTeam) {
          throw new Error("Could not find player's next tourney team... something's wrong");
        }
        // calculate the intersection of who stuck around from this tournament
        const teammatesToLookFor = intersection(team.players, thisPlayersNextTourneyTeam.players);

        // Only bother to look for a matching link if we have any teammates along with us
        let link: string[] | undefined = undefined;
        if (teammatesToLookFor.length > 1) {
          // What's next for this player? That determines outgoing links
          // Do we have an existing link for any other players in this team to the same next tournament in the same team?
          link = node.links[thisPlayersNextTourney]?.find((l) => {
            // Check if `l` contains any of our teammates
            return l.some((teammate) => !!teammatesToLookFor.find((otherP) => otherP === teammate));
          });
        }

        // Couldn't find matching link? Set one up
        if (!link) {
          if (!(thisPlayersNextTourney in node.links)) {
            node.links[thisPlayersNextTourney] = [];
          }
          link = [];
          node.links[thisPlayersNextTourney].push(link);
        }

        link.push(p);
      });
    });

    return node;
  });

  return nodes;
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
