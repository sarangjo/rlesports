import { Link } from "./types";
import { Tournament, Region } from "../types";

export const tournaments: Tournament[] = [
  {
    name: "Tournament I",
    start: "2023-01-01",
    end: "2023-01-08",
    region: Region.NORTH_AMERICA,
    teams: [
      {
        name: "Team A",
        players: ["Player 1", "Player 2", "Player 3"],
        region: Region.NORTH_AMERICA,
        color: "skyblue",
      },
      {
        name: "Team B",
        players: ["Player 4", "Player 5", "Player 6"],
        region: Region.NORTH_AMERICA,
        color: "orange",
      },
    ],
  },
  {
    name: "Tournament II",
    start: "2023-02-01",
    end: "2023-02-08",
    region: Region.NORTH_AMERICA,
    teams: [
      {
        name: "Team A",
        players: ["Player 1", "Player 2", "Player 4"],
        region: Region.NORTH_AMERICA,
        color: "skyblue",
      },
      {
        name: "Team B",
        players: ["Player 3", "Player 5", "Player 6"],
        region: Region.NORTH_AMERICA,
        color: "orange",
      },
    ],
  },
];

export const links: Link[] = [
  {
    from: { tournament: "Tournament I", team: "Team A" },
    to: { tournament: "Tournament II", team: "Team A" },
    players: ["Player 1", "Player 2"],
  },
  {
    from: { tournament: "Tournament I", team: "Team A" },
    to: { tournament: "Tournament II", team: "Team B" },
    players: ["Player 3"],
  },
  {
    from: { tournament: "Tournament I", team: "Team B" },
    to: { tournament: "Tournament II", team: "Team A" },
    players: ["Player 4"],
  },
  {
    from: { tournament: "Tournament I", team: "Team B" },
    to: { tournament: "Tournament II", team: "Team B" },
    players: ["Player 5", "Player 6"],
  },
];
