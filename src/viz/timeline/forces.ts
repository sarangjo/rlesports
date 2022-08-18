import { TeamSegmentNode } from "./types";

// This is a function that puts the team segments together that share players across them.
export function samePlayersForce() {
  let nodes: TeamSegmentNode[];
  let strength: number | ((d: TeamSegmentNode) => number) = 1;

  function force(alpha: number) {
    nodes?.forEach((node1) => {
      // Each node gives node1 a version bump either away from it or toward it, the magnitude being a function of the strength

      // TODO only limit nodes that are adjacent - we don't care about nodes a million miles away;
      // or like, use `x` to scale down the force HARSHLY
      nodes?.forEach((node2) => {
        // Okay, we have our two nodes. How does node1 get affected?
        //
        const intersection = [node1.players, node2.players].reduce((a, b) =>
          a.filter((c) => b.includes(c)),
        );

        const factor = intersection.length !== 0 ? -1 : intersection.length / 2;
        // If they share players, we want node1 to move **toward** node2, so we give it a velocity
        // in that direction.
        const desiredY = node2.fy || node2.y || 0;
        const basicYDiff = desiredY - (node1.y || 0);
        const vel =
          basicYDiff *
          factor *
          (typeof strength === "function" ? strength(node1) : strength) *
          alpha;
        node1.vy = (node1.vy || 0) + vel;
      });
    });
  }

  force.initialize = function (_: TeamSegmentNode[]) {
    nodes = _;
  };

  force.strength = function (_: number): any {
    return arguments.length ? ((strength = typeof _ === "function" ? _ : +_), force) : strength;
  };

  return force;
}
