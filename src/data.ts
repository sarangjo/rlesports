import { Tournament } from "./types";
import { Link } from "./viz/types";
import SortedSet from "collections/sorted-set";

const tourneyEqual = (a: Tournament, b: Tournament) => a.start === b.start && a.end === b.end;
const tourneyCompare = (a: Tournament, b: Tournament) =>
  a.start < b.start ? -1 : a.start > b.start ? 1 : a.end < b.end ? -1 : a.end > b.end ? 1 : 0;

// Given a list of tournaments, creates links that connect players from tournament to tournament,
// representing how a player's team membership may or may not change
export function tournamentsToLinks(tournaments: Tournament[]): Link[] {
  // Handy way to access tournaments by name
  const tournamentMap: Record<string, Tournament> = {};

  // 2-pass approach. In the first pass, create player histories by tournament + team.
  const playerTimelines: Record<string, SortedSet.SortedSet<Tournament>> = {};
  tournaments.map((tourney) => {
    tourney.teams.forEach((team) => {
      team.players.forEach((p) => {
        if (!(p in playerTimelines)) {
          playerTimelines[p] = new SortedSet(undefined, tourneyEqual, tourneyCompare);
        }

        playerTimelines[p].add(tourney);
      });
    });

    tournamentMap[tourney.name] = tourney;
  });

  const links: Link[] = [];

  // In the second pass, use the player histories to create a flat list of links, going through each
  // tournament
  tournaments.forEach((tourney) => {
    // Map of next tournament name -> list of links that connect to that tournament
    const thisTourneyLinks = {} as Record<string, Link[]>;

    tourney.teams.forEach((team) => {
      team.players.forEach((p) => {
        // Next tournament that we need to create the link to
        const thisPlayersNextTourney = playerTimelines[p].findLeastGreaterThan(tourney);
        if (!thisPlayersNextTourney) {
          // End of the road for this player, gg.
          // FIXME solo player nodes?
          return;
        }

        // Which teammates stuck with this player for the next tourney?
        const thisPlayersNextTourneyTeam = thisPlayersNextTourney.value.teams.find((t) =>
          t.players.find((otherP) => otherP === p),
        );
        if (!thisPlayersNextTourneyTeam) {
          throw new Error("Could not find player's next tourney team... something's wrong");
        }
        // calculate the intersection of who stuck around from this tournament
        const teammatesToLookFor = [team.players, thisPlayersNextTourneyTeam.players].reduce(
          (a, b) => a.filter((c) => b.includes(c)),
        );

        // Only bother to look for a matching link if we have any teammates along with us
        let link: Link | undefined = undefined;
        if (teammatesToLookFor.length > 1) {
          // What's next for this player? That determines outgoing links
          // Do we have an existing link for any other players in this team to the same next tournament in the same team?
          link = thisTourneyLinks[thisPlayersNextTourney.value.name]?.find((l) => {
            // Check if `l` contains any of our teammates
            return l.players.some(
              (teammate) => !!teammatesToLookFor.find((otherP) => otherP === teammate),
            );
          });
        }

        // Couldn't find matching link? Set one up
        if (!link) {
          // Fencepost
          if (!(thisPlayersNextTourney.value.name in thisTourneyLinks)) {
            thisTourneyLinks[thisPlayersNextTourney.value.name] = [];
          }

          // Create a new empty link for this player
          link = {
            from: { tournament: tourney.name, team: team.name },
            to: {
              tournament: thisPlayersNextTourney.value.name,
              team: thisPlayersNextTourneyTeam.name,
            },
            players: [],
          };
          thisTourneyLinks[thisPlayersNextTourney.value.name].push(link);
        }

        link.players.push(p);
      });
    });

    for (const l in thisTourneyLinks) {
      links.push(...thisTourneyLinks[l]);
    }
  });

  return links;
}
