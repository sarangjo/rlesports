import { TournamentPlayerNode } from "./types";
import { partition, map, sortBy, filter, reduce, concat, forEach } from "lodash";
import { CIRCLE_RADIUS } from "./constants";

// Pushes players on the same team into each other
export function sameTeamForce() {
  let nodes: TournamentPlayerNode[];
  let strength: number | ((d: TournamentPlayerNode) => number) = 1;

  function getVel(desiredY: number, node: TournamentPlayerNode, alpha: number) {
    // velocity due to this
    return (
      (desiredY - (node.y || 0)) *
      (typeof strength === "function" ? strength(node) : strength) *
      alpha
    );
  }

  // Go through each of the forces and set some properties on the node
  function force(alpha: number) {
    forEach(nodes, (node) => {
      // find the n other nodes in the same tournament with the same team.
      // based on how many nodes there are, figure out what index of our team
      // we want to become
      const sameTeamNodes = partition(
        sortBy(
          filter(
            nodes,
            (n) =>
              n.tournamentIndex === node.tournamentIndex &&
              n.teamIndex === node.teamIndex &&
              n.playerIndex !== node.playerIndex,
          ),
          ["y"],
        ),
        (n) => (n.y || 0) <= (node.y || 0),
      );

      // read current positions and set new vx,vy
      const velosUp = map(sameTeamNodes[0], (n, i, arr) => {
        // desired position of node for this n is
        const desiredY = (n.fy || n.y || 0) + 2 * CIRCLE_RADIUS * (arr.length - i);
        return getVel(desiredY, node, alpha);
      });
      const velosDown = map(sameTeamNodes[1], (n, i) => {
        // desired position of node for this n is
        const desiredY = (n.fy || n.y || 0) - 2 * CIRCLE_RADIUS * (i + 1);
        return getVel(desiredY, node, alpha);
      });
      const delVy = reduce(concat(velosDown, velosUp), (acc, cur) => acc + cur, 0);
      node.vy = node.vy ? node.vy + delVy : delVy;
    });
  }

  force.initialize = function (_: TournamentPlayerNode[]) {
    nodes = _;
  };

  // TODO fix type
  force.strength = function (_: number): any {
    return arguments.length ? ((strength = typeof _ === "function" ? _ : +_), force) : strength;
  };

  return force;
}

// Pulls players on different teams apart
export function differentTeamForce() {
  let nodes: TournamentPlayerNode[];

  function force(alpha: number) {
    forEach(nodes, (node) => {
      const sameTournamentNodes = filter(
        nodes,
        (n) => n.tournamentIndex === node.tournamentIndex && n.teamIndex !== node.teamIndex,
      );

      const delVy = reduce(
        sameTournamentNodes,
        (acc, cur) => {
          // return acc + ()
        },
        0,
      );
    });
  }

  return force;
}
