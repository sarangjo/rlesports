import { forceCollide, forceManyBody, forceSimulation, Simulation } from "d3";
import { clamp, reduce } from "lodash";
import { Player } from "../../../types";
import { UIRectangle, UIText, TextOrientation, UIConnector } from "../../../types/svg";
import { s2d } from "../../../util/datetime";
import { PlayerTimelineProcessor } from "../../../util/timeline";
import { samePlayersForce } from "../forces";
import { PLAYER_HEIGHT, TeamSegmentLink, TeamSegmentNode, TeamSegmentSimulation } from "../types";
import { constructTeamMap, getSimRawNodesLinks } from "./map";

export class TeamSegmentTimelineProcessor extends PlayerTimelineProcessor {
  private sim: TeamSegmentSimulation;

  constructor(players: Player[], teamColors: Record<string, string>, bounds: UIRectangle) {
    super(players, teamColors, bounds);

    this.sim = this.createForceSimulation();
  }

  private node2Rectangle(seg: TeamSegmentNode, yOverride?: number): [UIRectangle, UIText] {
    const x = this.x(s2d(seg.start));
    const width = seg.end ? this.x(s2d(seg.end)) - x : this.bounds.x + this.bounds.width - x;

    const height = seg.players.length * PLAYER_HEIGHT;
    const y = clamp(
      (seg.y !== undefined ? seg.y : yOverride !== undefined ? yOverride : this.bounds.y) +
        height / 2,
      this.bounds.y + height / 2,
      this.bounds.y + this.bounds.height - height / 2,
    );

    return [
      {
        x,
        width,
        height,
        y: y,
        color: this.teamColors[seg.team],
      } as UIRectangle,
      {
        orientation: TextOrientation.HORIZONTAL,
        x,
        y: y + PLAYER_HEIGHT / 2,
        text: seg.players
          .sort()
          .map((name) => name.split(" ")[1])
          .join(""), // `${seg.team}: ${seg.players.sort()}`,
      } as UIText,
    ];
  }

  // Try 1 is using random placement
  public getTSRectangles(): [UIRectangle, UIText][] {
    const teamMap = constructTeamMap(this.players);

    return reduce(
      teamMap,
      (acc, segments) => {
        // Create a rectangle per seg
        segments.toArray().forEach((seg) => {
          acc.push(this.node2Rectangle(seg, Math.random() * this.bounds.height + this.bounds.y));
        });

        return acc;
      },
      [] as [UIRectangle, UIText][],
    );
  }

  // Try 2 is using force simulations
  private createForceSimulation(): Simulation<TeamSegmentNode, TeamSegmentLink> {
    return (
      forceSimulation<TeamSegmentNode>()
        // .force(
        //   "link",
        //   forceLink<TeamSegmentNode, TeamSegmentLink>() /*.distance(400)*/, // TODO WAT IS THIS????? N + 2
        // )
        .force("charge", forceManyBody().strength(-545))
        // .force("y", forceY(this.bounds.y + this.bounds.height / 2).strength(0.7))
        .force(
          "collide",
          forceCollide<TeamSegmentNode>((seg) => seg.players.length * PLAYER_HEIGHT),
        )
        .force("samePlayers", samePlayersForce().strength(0.5))
      // .force("sameTeam", sameTeamForce().strength(0.8))
      // .force("diffTeam", differentTeamForce().strength(15));
    );
  }

  public setupSimulation(onUpdate: () => void) {
    const teamMap = constructTeamMap(this.players);
    const [nodes, links] = getSimRawNodesLinks(teamMap);

    // Assign nodes/links to the sim
    this.sim.nodes(nodes);
    // (this.sim.force("link") as ForceLink<TeamSegmentNode, TeamSegmentLink>).links(links);

    this.sim.on("tick", onUpdate);
  }

  public getSimNodeRects(): [UIRectangle, UIText][] {
    return this.sim.nodes().map((node) => {
      return this.node2Rectangle(node);
    });
  }

  public getSimLinks(): UIConnector[] {
    return []; /*return (this.sim.force("link") as ForceLink<TeamSegmentNode, TeamSegmentLink>)
      .links()
      .map((link) => {
        const start = this.node2Rectangle(link.source as TeamSegmentNode)[0];
        const end = this.node2Rectangle(link.target as TeamSegmentNode)[0];

        return {
          connectorType: ConnectorType.LINE,
          start: { x: start.x + start.width / 2, y: start.y + start.height / 2 },
          end: { x: end.x + end.width / 2, y: end.y + end.height / 2 },
          stroke: "black",
        } as UILine;
      });*/
  }
}
