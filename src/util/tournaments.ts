import { reduce, concat, map } from "lodash";
import { CIRCLE_RADIUS } from "../constants";
import { RlcsSeason, Tournament } from "../types";
import { TournamentPlayerNode } from "../types/graph";

// Data managing
export const tournamentsToPlayerNodes = (tournaments: Tournament[]) => {
  return reduce(
    tournaments,
    (acc1, tournament, tournamentIndex) =>
      concat(
        acc1,
        reduce(
          tournament.teams,
          (acc2, team, teamIndex) =>
            // TODO eventually add subs
            concat(
              acc2,
              reduce(
                team.players,
                (acc3, _player: string, playerIndex) =>
                  concat(acc3, {
                    tournamentIndex,
                    teamIndex,
                    playerIndex,
                    id: getNodeId(tournamentIndex, teamIndex, playerIndex),
                    x: 0,
                    y: tournamentY({
                      tournamentIndex,
                      teamIndex,
                      playerIndex,
                      id: getNodeId(tournamentIndex, teamIndex, playerIndex),
                    }), // teamIndex <= tournament.teams.length / 2 ? 0 : HEIGHT,
                  }),
                [] as TournamentPlayerNode[],
              ),
            ),
          [] as TournamentPlayerNode[],
        ),
      ),
    [] as TournamentPlayerNode[],
  );
};

export function tournamentMap<T>(seasons: RlcsSeason[], func: (tournament: Tournament) => T) {
  return reduce(
    seasons,
    (acc, s) => {
      // Append from all sections
      const sectionsMapped = reduce(
        s.sections,
        (acc2, sec) => {
          // Append from all tournaments
          return concat(
            acc2,
            map(sec.tournaments, (t) => {
              return func(t);
            }),
          );
        },
        [] as T[],
      );

      return concat(acc, sectionsMapped);
    },
    [] as T[],
  );
}

export const getPlayerName = (tournaments: Tournament[], d: TournamentPlayerNode) =>
  tournaments[d.tournamentIndex].teams[d.teamIndex].players[d.playerIndex];

export const getNodeId = (...indices: number[]): string => indices.join("-");

export const getNode = (id: string): TournamentPlayerNode =>
  id.split("-").reduce((acc, n, i) => {
    acc[i === 0 ? "tournamentIndex" : i === 1 ? "teamIndex" : "playerIndex"] = +n;
    return acc;
  }, {} as TournamentPlayerNode);

// y depends on team and player index
export const tournamentY = (d: TournamentPlayerNode) => simpleY(d.teamIndex, d.playerIndex);

export const simpleY = (teamIndex: number, playerIndex: number, playersPerTeam = 5, buffer = 4) =>
  // buffer
  buffer * CIRCLE_RADIUS +
  // team spacing
  teamIndex * playersPerTeam * (2 * CIRCLE_RADIUS) +
  // player spacing
  playerIndex * (2 * CIRCLE_RADIUS);

export const tournamentAcronym = (name: string) =>
  name.replaceAll(/[^A-Z0-9/]/g, "").replaceAll("/", " ");
// .split(/[^A-Za-z0-9]/)
// .map((word) => word[0])
// .join("");
