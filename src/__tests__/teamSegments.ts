import { TeamSegmentListDirect } from "../timeline/positioning/teamSegments/direct";
import { TeamSegmentListEvents } from "../timeline/positioning/teamSegments/events";
import { segmentsEqual, TSL } from "../timeline/types";

[TeamSegmentListDirect, TeamSegmentListEvents].forEach((TeamSegmentList, i) => {
  describe(i === 0 ? "Direct" : "Events", () => {
    describe("one", () => {
      test("add to empty", () => {
        const l: TSL = new TeamSegmentList();

        l.insert("P1", "2022-01-01", "2022-01-02");

        expect(
          segmentsEqual(l.toArray(), [
            { players: ["P1"], start: "2022-01-01", end: "2022-01-02" },
          ])
        );
      });
    });

    describe("two", () => {
      test("add before", () => {
        const l: TSL = new TeamSegmentList();

        l.insert("P1", "2022-01-01", "2022-01-02");
        l.insert("P2", "2021-01-01", "2021-01-02");

        expect(
          segmentsEqual(l.toArray(), [
            { players: ["P2"], start: "2021-01-01", end: "2021-01-02" },
            { players: ["P1"], start: "2022-01-01", end: "2022-01-02" },
          ])
        );
      });

      test("add before/intersect", () => {
        const l: TSL = new TeamSegmentList();

        l.insert("P1", "2022-01-01", "2022-02-01");
        l.insert("P2", "2021-01-01", "2022-01-22");

        expect(
          segmentsEqual(l.toArray(), [
            { players: ["P2"], start: "2021-01-01", end: "2022-01-01" },
            { players: ["P1", "P2"], start: "2022-01-01", end: "2021-01-22" },
            { players: ["P1"], start: "2022-01-22", end: "2022-02-01" },
          ])
        );
      });

      test("add before/intersect/after", () => {
        const l: TSL = new TeamSegmentList();

        l.insert("P1", "2022-01-01", "2022-02-01");
        l.insert("P2", "2021-01-01", "2023-01-01");

        expect(
          segmentsEqual(l.toArray(), [
            { players: ["P2"], start: "2021-01-01", end: "2022-01-01" },
            { players: ["P1", "P2"], start: "2022-01-01", end: "2021-02-01" },
            { players: ["P2"], start: "2022-02-01", end: "2023-01-01" },
          ])
        );
      });

      test("add intersect/after", () => {
        const l: TSL = new TeamSegmentList();

        l.insert("P1", "2022-01-01", "2022-02-01");
        l.insert("P2", "2022-01-20", "2023-01-01");

        expect(
          segmentsEqual(l.toArray(), [
            { players: ["P1"], start: "2022-01-01", end: "2022-01-20" },
            { players: ["P1", "P2"], start: "2022-01-20", end: "2022-02-01" },
            { players: ["P2"], start: "2022-02-01", end: "2023-01-01" },
          ])
        );
      });

      test("add after", () => {
        const l: TSL = new TeamSegmentList();

        l.insert("P1", "2022-01-01", "2022-02-01");
        l.insert("P2", "2022-03-20", "2023-01-01");

        expect(
          segmentsEqual(l.toArray(), [
            { players: ["P1"], start: "2022-01-01", end: "2022-02-01" },
            { players: ["P2"], start: "2022-03-20", end: "2023-01-01" },
          ])
        );
      });

      test("add intersect/endless", () => {
        const l: TSL = new TeamSegmentList();

        l.insert("P1", "2022-01-01", "2022-01-03");
        l.insert("P2", "2022-01-02");

        expect(
          segmentsEqual(l.toArray(), [
            { players: ["P1"], start: "2022-01-01", end: "2022-01-02" },
            { players: ["P1", "P2"], start: "2022-01-02", end: "2022-01-03" },
            { players: ["P2"], start: "2022-01-03" },
          ])
        );
      });
    });
  });
});
