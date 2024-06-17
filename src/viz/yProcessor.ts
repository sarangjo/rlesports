import { TEAM_HEIGHT } from "../constants";
import { UITournament } from "./types";

class XSegments {
  private zones: { start: number; end: number; x: number }[];

  constructor() {
    this.zones = [];
  }

  public add(newT: UITournament) {
    // Find the intersection point
    let found = false;

    this.zones.forEach((t) => {
      if (newT.x < t.start) {
        // Where does newT end?
        // 0) to the left
        // 1) inside
        // 2) to the right
        if (newT.x + newT.width < t.start) {
          // to the left. boohoo.
          return;
        } else if (newT.x + newT.width < t.end) {
          // inside
        }
      }
    });
  }
}

// Better idea: connect tournaments that have overlap based on start/end dates (duh) and just look
// to allocate one tournament and its connections at a time, breadth-first

export function yProcess(tournaments: UITournament[]): UITournament[] {
  debugger;

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

  while (tourneysToProcess.length > 0) {
    // For this tournament, we start with the current tournament and then go through the linked tourneys
    const cur = tourneysToProcess.shift()!;
    const curT = tournaments.find((t) => t.name === cur)!;

    let y = 0;
    if (!done.has(cur)) {
      done.add(cur);
      processed.push(Object.assign({}, curT, { y }));
    }
    y += TEAM_HEIGHT * curT.teams.length;

    // Process overlaps
    tourneyGraph[cur].forEach((overlap) => {
      const overlapT = tournaments.find((t) => t.name === overlap)!;
      if (!done.has(overlap)) {
        done.add(overlap);
        processed.push(Object.assign({}, overlapT, { y }));
      }
      y += TEAM_HEIGHT * overlapT.teams.length;
    });
  }

  return processed;
}
