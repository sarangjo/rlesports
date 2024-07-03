import { ScaleTime, scaleTime } from "d3-scale";
import { Tournament } from "../types";
import { UITournament } from "./types";
import { TEAM_HEIGHT, WIDTH } from "../constants";
import { s2d } from "../util/datetime";

const uiTournamentToTournament = (
  x: ScaleTime<number, number, never>,
  tournament: Tournament,
  y: number,
): UITournament => ({
  // Don't want to spread ...tournament because `teams` doesn't match
  name: tournament.name,
  start: tournament.start,
  end: tournament.end,
  region: tournament.region,

  // UI elements
  x: x(s2d(tournament.start)),
  width: x(s2d(tournament.end)) - x(s2d(tournament.start)),
  y,

  teams: tournament.teams.map((team, teamIndex) => ({
    ...team,

    x: x(s2d(tournament.start)),
    width: x(s2d(tournament.end)) - x(s2d(tournament.start)),
    y: y + teamIndex * TEAM_HEIGHT,
  })),
});

// Better idea: connect tournaments that have overlap based on start/end dates (duh) and just look
// to allocate one tournament and its connections at a time, breadth-first
export function process(tournaments: Tournament[]): [number, UITournament[]] {
  const [start, end] = tournaments.reduce(
    (acc, t) => {
      if (t.start < acc[0]) {
        acc[0] = t.start;
      }
      if (t.end > acc[1]) {
        acc[1] = t.end;
      }
      return acc;
    },
    [tournaments[0].start, tournaments[0].end],
  );

  const x = scaleTime()
    .domain([s2d(start), s2d(end)])
    .range([0, WIDTH]);

  const tourneyGraph = tournaments.reduce((acc, cur) => {
    const conflicts = tournaments
      .filter((otherT) => {
        const conflict =
          (otherT.start < cur.start && otherT.end > cur.start) ||
          (otherT.start >= cur.start && otherT.start <= cur.end);
        return otherT.name !== cur.name && conflict;
      })
      .map((u) => u.name);

    acc[cur.name] = conflicts;

    return acc;
  }, {} as Record<string, string[]>);

  console.log(tourneyGraph);

  // Iterate through tourneyGraph breadth-first and assign it y-segments
  const tourneysToProcess = tournaments.map((t) => t.name);
  const done = new Set<string>();
  const processed: UITournament[] = [];
  let maxY = 0;

  while (tourneysToProcess.length > 0) {
    // For this tournament, we start with the current tournament and then go through the linked tourneys
    const cur = tourneysToProcess.shift()!;
    const curT = tournaments.find((t) => t.name === cur)!;

    let y = 0;
    if (!done.has(cur)) {
      done.add(cur);
      processed.push(uiTournamentToTournament(x, curT, y));
    }
    y += TEAM_HEIGHT * (curT.teams.length + 1);

    // Process overlaps
    tourneyGraph[cur].forEach((overlap) => {
      const overlapT = tournaments.find((t) => t.name === overlap)!;
      if (!done.has(overlap)) {
        done.add(overlap);
        processed.push(uiTournamentToTournament(x, overlapT, y));
      }
      y += TEAM_HEIGHT * (overlapT.teams.length + 1);
    });

    maxY = maxY < y ? y : maxY;
  }

  return [maxY, processed];
}
