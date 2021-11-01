import { Team } from ".";
import { Region } from ".";

export interface TournamentDoc {
  // Metadata
  season: string;
  region: Region;
  index: number;
  // Name
  name: string;
  // LP data
  start: string;
  end: string;
  teams: Team[];
}
