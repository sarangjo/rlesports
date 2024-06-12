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

export function yProcess(tournaments: UITournament[]) {
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
}
