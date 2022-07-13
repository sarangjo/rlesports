import { Player } from "../../types";

export const PLAYERS: Player[] = [
  { name: "Player 1", memberships: [{ join: "2022-01-01", team: "Team 1" }] },
  {
    name: "Player 2",
    memberships: [{ join: "2021-01-01", leave: "2022-01-01", team: "Team 1" }],
  },
];
