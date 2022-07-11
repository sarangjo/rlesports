import { Player } from "../types";

// Each team has a LinkedList

class TeamSegment {
  public players: string[];
  public start: string;
  public end: string;

  public prev: TeamSegment | null;
  public next: TeamSegment | null;

  constructor(players: string[], start: string, end: string, prev: TeamSegment | null = null, next: TeamSegment | null = null) {
    this.players = players;
    this.start = start;
    this.end = end;

    this.prev = prev;
    this.next = next;
  }
}

interface TeamSegmentList {
  head: TeamSegment;
}

export function process(players: Player[]) {
  // Start putting together a view of all team "versions", based on the players, which will loosely translate to "areas"
  const teamMap: Record<string, TeamSegmentList> = {};

  players.forEach((p) => {
    p.memberships.forEach((m) => {
      // For this membership, find the team

      // Case 1: no team has been found yet
      if (!(m.team in teamMap)) {
        // Cool, this is the first instance of this team we've seen; simply create the first node
        teamMap[]
      }
    });
  });
}
