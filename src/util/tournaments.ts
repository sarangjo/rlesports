import { reduce, concat, map } from "lodash";
import { RlcsSeason, Tournament } from "../types";

// Maps RLCS seasons into a flat array of tournaments; apply given function to each tournament
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

export const tournamentAcronym = (name: string) =>
  name.replaceAll(/[^A-Z0-9/]/g, "").replaceAll("/", " ");
// .split(/[^A-Za-z0-9]/)
// .map((word) => word[0])
// .join("");
