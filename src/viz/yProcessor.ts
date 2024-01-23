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

export function yProcess(tournaments: UITournament[]) {
  const occupiedZones = new XSegments();

  tournaments.forEach((t) => occupiedZones.add(t));
}

// Modifies uiTournaments in-place
// Okay so this is a simple allocator, we just go through and occupy regions of x and y from the top to the bottom
export default function (uiTournaments: UITournament[]) {
  for (const tournament of uiTournaments) {
    // What's the x range?
  }
}
