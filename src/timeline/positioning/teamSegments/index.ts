import d3 from "d3";
import { ScaleTime } from "d3-scale";
import { Player } from "../../../types";
import { UIRectangle } from "../../../types/ui";
import { TeamSegment, UIPlayer } from "../../types";

function forceGraph() {}

export function processTSRectangles(
  players: Player[],
  x: ScaleTime<number, number>,
  bounds: UIRectangle,
  teamColors: Record<string, string>
): UIRectangle[] {}

type TeamSegmentNode = d3.SimulationNodeDatum & TeamSegment;

function simSetup(nodes: TeamSegmentNode[]) {
  d3.forceSimulation<TeamSegmentNode>(nodes);
}
