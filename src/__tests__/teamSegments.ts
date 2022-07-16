import { PLAYERS } from "../data/sample/players";
import { TeamSegmentListDirect } from "../viz/timeline/teamSegments/list/direct";
import { TeamSegmentListEvents } from "../viz/timeline/teamSegments/list/events";
import { isTeamSegmentListEqual, TSL } from "../viz/timeline/teamSegments/list";
import { constructTeamMap } from "../viz/timeline/teamSegments/map";

[TeamSegmentListDirect, TeamSegmentListEvents].forEach((TeamSegmentList, i) => {
  describe(i === 0 ? "Direct" : "Events", () => {
    describe("one", () => {
      test("add to empty", () => {
        const l: TSL = new TeamSegmentList("t");

        l.insert("P1", "2022-01-01", "2022-01-02");

        expect(
          isTeamSegmentListEqual(l.toArray(), [
            { team: "t", players: ["P1"], start: "2022-01-01", end: "2022-01-02" },
          ]),
        );
      });
    });

    describe("two", () => {
      test("add before", () => {
        const l: TSL = new TeamSegmentList("t");

        l.insert("P1", "2022-01-01", "2022-01-02");
        l.insert("P2", "2021-01-01", "2021-01-02");

        expect(
          isTeamSegmentListEqual(l.toArray(), [
            { team: "t", players: ["P2"], start: "2021-01-01", end: "2021-01-02" },
            { team: "t", players: ["P1"], start: "2022-01-01", end: "2022-01-02" },
          ]),
        );
      });

      test("add before/intersect", () => {
        const l: TSL = new TeamSegmentList("t");

        l.insert("P1", "2022-01-01", "2022-02-01");
        l.insert("P2", "2021-01-01", "2022-01-22");

        expect(
          isTeamSegmentListEqual(l.toArray(), [
            { team: "t", players: ["P2"], start: "2021-01-01", end: "2022-01-01" },
            { team: "t", players: ["P1", "P2"], start: "2022-01-01", end: "2021-01-22" },
            { team: "t", players: ["P1"], start: "2022-01-22", end: "2022-02-01" },
          ]),
        );
      });

      test("add before/intersect/after", () => {
        const l: TSL = new TeamSegmentList("t");

        l.insert("P1", "2022-01-01", "2022-02-01");
        l.insert("P2", "2021-01-01", "2023-01-01");

        expect(
          isTeamSegmentListEqual(l.toArray(), [
            { team: "t", players: ["P2"], start: "2021-01-01", end: "2022-01-01" },
            { team: "t", players: ["P1", "P2"], start: "2022-01-01", end: "2021-02-01" },
            { team: "t", players: ["P2"], start: "2022-02-01", end: "2023-01-01" },
          ]),
        );
      });

      test("add intersect/after", () => {
        const l: TSL = new TeamSegmentList("t");

        l.insert("P1", "2022-01-01", "2022-02-01");
        l.insert("P2", "2022-01-20", "2023-01-01");

        expect(
          isTeamSegmentListEqual(l.toArray(), [
            { team: "t", players: ["P1"], start: "2022-01-01", end: "2022-01-20" },
            { team: "t", players: ["P1", "P2"], start: "2022-01-20", end: "2022-02-01" },
            { team: "t", players: ["P2"], start: "2022-02-01", end: "2023-01-01" },
          ]),
        );
      });

      test("add after", () => {
        const l: TSL = new TeamSegmentList("t");

        l.insert("P1", "2022-01-01", "2022-02-01");
        l.insert("P2", "2022-03-20", "2023-01-01");

        expect(
          isTeamSegmentListEqual(l.toArray(), [
            { team: "t", players: ["P1"], start: "2022-01-01", end: "2022-02-01" },
            { team: "t", players: ["P2"], start: "2022-03-20", end: "2023-01-01" },
          ]),
        );
      });

      test("add intersect/endless", () => {
        const l: TSL = new TeamSegmentList("t");

        l.insert("P1", "2022-01-01", "2022-01-03");
        l.insert("P2", "2022-01-02");

        expect(
          isTeamSegmentListEqual(l.toArray(), [
            { team: "t", players: ["P1"], start: "2022-01-01", end: "2022-01-02" },
            { team: "t", players: ["P1", "P2"], start: "2022-01-02", end: "2022-01-03" },
            { team: "t", players: ["P2"], start: "2022-01-03" },
          ]),
        );
      });
    });
  });
});

test("map creation", () => {
  const teamMap = constructTeamMap(PLAYERS);

  expect(Object.keys(teamMap).length).toBe(2); // 2 teams
  expect(teamMap["Team 1"].toArray().length).toBe(3);
  expect(teamMap["Team 2"].toArray().length).toBe(5);
});
