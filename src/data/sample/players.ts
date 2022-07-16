import { Player } from "../../types";

export const PLAYERS = [
  {
    memberships: [
      {
        join: "2022-01-01",
        team: "Team 1",
      },
    ],
    name: "Player 1",
  },
  {
    memberships: [
      {
        join: "2022-01-01",
        team: "Team 1",
      },
    ],
    name: "Player 2",
  },
  {
    memberships: [
      {
        join: "2022-01-01",
        leave: "2022-02-15",
        team: "Team 1",
      },
      {
        join: "2022-02-16",
        team: "Team 2",
      },
    ],
    name: "Player 3",
  },
  {
    memberships: [
      {
        join: "2022-01-01",
        leave: "2022-02-17",
        team: "Team 2",
      },
      {
        join: "2022-02-20",
        team: "Team 1",
      },
    ],
    name: "Player 4",
  },
  {
    memberships: [
      {
        join: "2022-01-05",
        team: "Team 2",
      },
    ],
    name: "Player 5",
  },
  {
    memberships: [
      {
        join: "2022-01-06",
        team: "Team 2",
      },
    ],
    name: "Player 6",
  },
] as Player[];
