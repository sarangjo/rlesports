import { Region, RlcsSeason } from "../../types";

export const SEASONS = [
  {
    season: "1",
    sections: [
      {
        name: "Section 0",
        tournaments: [
          {
            region: Region.NORTH_AMERICA,
            name: "Season 1 Section 0 Tournament 0",
            start: "2021-02-01",
            end: "2021-02-10",
            teams: [
              {
                name: "Team 1",
                players: ["Player 1", "Player 2", "Player 3"],
                region: Region.NORTH_AMERICA,
              },
              {
                name: "Team 1",
                players: ["Player 4", "Player 5", "Player 6"],
                region: Region.NORTH_AMERICA,
              },
            ],
          },
        ],
      },
      {
        name: "Section 1",
        tournaments: [
          {
            region: Region.NORTH_AMERICA,
            name: "Season 1 Section 1 Tournament 0",
            start: "2021-03-01",
            end: "2021-03-10",
            teams: [
              {
                name: "Team 1",
                players: ["Player 1", "Player 2", "Player 4"],
                region: Region.NORTH_AMERICA,
              },
              {
                name: "Team 2",
                players: ["Player 3", "Player 5", "Player 6"],
                region: Region.NORTH_AMERICA,
              },
            ],
          },
        ],
      },
    ],
  },
] as RlcsSeason[];
