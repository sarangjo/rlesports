We assign "areas" to teams based on the players and their movement. These areas are required to be non-intersecting, obviously - so they will naturally spread out along the y, as x is fixed.

For example in the simple example of two players swapping teams, we would have the following "areas":

```js
export const PLAYERS = [
  { name: "Player 1", memberships: [{ join: "2022-01-01", team: "Team 1" }] },
  { name: "Player 2", memberships: [{ join: "2022-01-01", team: "Team 1" }] },
  {
    name: "Player 3",
    memberships: [
      { join: "2022-01-01", leave: "2022-02-15", team: "Team 1" },
      { join: "2022-02-16", team: "Team 2" },
    ],
  },
  {
    name: "Player 4",
    memberships: [
      { join: "2022-01-01", leave: "2022-02-17", team: "Team 2" },
      { join: "2022-02-20", team: "Team 1" },
    ],
  },
  { name: "Player 5", memberships: [{ join: "2022-01-05", team: "Team 2" }] },
  { name: "Player 6", memberships: [{ join: "2022-01-06", team: "Team 2" }] },
] as Player[];
```

- Team 1
  - all three players
  - P1,2
  - P1,2,4
- Team 2
  - P4
  - P4,5
  - P4,5,6
  - P3,4,5,6
  - P3,5,6
