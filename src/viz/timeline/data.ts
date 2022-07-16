import { reduce } from "lodash";
import { scaleTime, ScaleTime } from "d3";
import { addDays, differenceInCalendarDays } from "date-fns";
import { EventType, Player } from "../../types";
import {
  ConnectorType,
  TextAnchor,
  TextOrientation,
  UIConnector,
  UILine,
  UIPoint,
  UIRectangle,
  UIText,
} from "../../types/ui";
import { getIndices } from "../../util/data";
import { d2s, s2d } from "../../util/datetime";
import {
  BUFFER,
  FILL_LEAVE,
  PLAYER_HEIGHT,
  Radius,
  STROKE_WIDTH_TEAM,
  TeamSegmentLink,
  TeamSegmentNode,
  TeamSegmentSimulation,
  TEXT_HEIGHT,
  UIPlayer,
} from "./types";
import * as d3 from "d3";
import { clamp } from "lodash";
import { constructTeamMap, getSimRawNodesLinks } from "./teamSegments/map";
import { COLOR_NO_TEAM, getTeamColor } from "../../util/colors";

export class DataProcessor {
  private start: string;
  private end: string;

  private x: ScaleTime<number, number>;

  private sim: TeamSegmentSimulation;

  constructor(
    private players: Player[],
    private teamColors: Record<string, string>,
    private bounds: UIRectangle,
  ) {
    // Set up our X/Y scales
    const { x, start, end } = this.setupX();
    this.x = x;
    this.start = start;
    this.end = end;

    this.sim = this.createForceSimulation();
  }

  private setupX() {
    // Calculating minimum and maximum:
    // [min/max] Try 1: events

    // Start is the earliest join of any player
    const start = this.players.reduce((acc, cur) => {
      // prettier-ignore
      return (!acc || cur.memberships[0]?.join < acc) ? cur.memberships[0]?.join : acc;
    }, "");

    const end = d2s(new Date());

    /*
    // End is the latest leave of any player, or now if there are no leaves
    this.players.reduce((acc, cur) => {
      const candidate = cur.memberships[cur.memberships.length - 1]?.leave || dateToStr(moment());

      return (!acc || candidate > acc) ? candidate : acc;
    }, ""); */

    if (!start || !end) {
      throw new Error(
        `Somethin's wrong! start ${JSON.stringify(start)} or end ${JSON.stringify(
          end,
        )} are undefined`,
      );
    }

    // [min/max] Try 2: tournaments
    // startDate = startDate > tournaments[0].start ? tournaments[0].start : startDate;
    // endDate = endDate < last(tournaments)!.end ? last(tournaments)!.end : endDate;

    return {
      x: scaleTime()
        .domain([s2d(start), s2d(end)])
        .range([this.bounds.x, this.bounds.x + this.bounds.width]),
      start,
      end,
    };
  }

  public getDates(): [UIText, UILine][] {
    const f = (m: Date): [UIText, UILine] => {
      const x = this.x(m);

      return [
        {
          x: x - TEXT_HEIGHT / 2,
          y: TEXT_HEIGHT,
          text: d2s(m),
          orientation: TextOrientation.VERTICAL,
        } as UIText,
        {
          start: { x, y: this.bounds.y },
          end: { x, y: this.bounds.y + this.bounds.height },
          connectorType: ConnectorType.LINE,
          stroke: "green",
        } as UILine,
      ];
    };

    return Array.from(
      {
        length: differenceInCalendarDays(s2d(this.end), s2d(this.start)) / 50 + 2,
      },
      (_, i) => f(addDays(s2d(this.start), i * 50)),
    ).concat([f(s2d(this.end))]);
  }

  /** SIMPLE PROCESSING */

  public getSimplePlayers(): UIPlayer[] {
    const indices = getIndices(this.players, (p) => p.name);
    const getY = (p: Player) => this.bounds.y + BUFFER + indices[p.name] * PLAYER_HEIGHT;

    return this.players.map((p) => this.processPlayer(p, getY));
  }

  private processPlayer(p: Player, getY: (p: Player) => number): UIPlayer {
    const uiP: UIPlayer = { events: [], connectors: [] };

    p.memberships.forEach((m, i) => {
      /* UI info for this m */

      const start: UIPoint = { x: this.x(s2d(m.join)), y: getY(p) };
      // If we have a leave, set that in the end point
      const end: UIPoint = {
        x: m.leave ? this.x(s2d(m.leave)) : this.bounds.x + this.bounds.width,
        y: getY(p),
      };
      const color = getTeamColor(m.team, this.teamColors);

      /* Transform data */

      // Join
      uiP.events.push({
        center: start,
        radius: Radius[EventType.JOIN],
        stroke: color,
        fill: color,
      });
      // Leave
      if (m.leave) {
        uiP.events.push({
          center: end,
          radius: Radius[EventType.LEAVE],
          stroke: COLOR_NO_TEAM,
          fill: FILL_LEAVE,
        });

        // Line connecting to next join, if any
        if (i !== p.memberships.length - 1) {
          uiP.connectors.push({
            connectorType: ConnectorType.LINE,
            start: end,
            end: {
              x: this.x(s2d(p.memberships[i + 1].join)),
              y: getY(p),
            },
            stroke: COLOR_NO_TEAM,
          } as UILine);
        }
      }

      // Membership
      uiP.connectors.push({
        start,
        end,
        stroke: color,
        connectorType: ConnectorType.LINE,
        strokeWidth: STROKE_WIDTH_TEAM,
      } as UILine);

      // Name
      if (i === 0) {
        uiP.name = {
          text: p.name,
          x: start.x - BUFFER,
          y: start.y + TEXT_HEIGHT / 2, // TODO arbitrary 5px adjustment
          anchor: TextAnchor.END,
          orientation: TextOrientation.HORIZONTAL,
        };
      }
    });

    return uiP;
  }

  /** TEAM SEGMENT-BASED PROCESSING */

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
      (acc, segments, team) => {
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
  private createForceSimulation(): d3.Simulation<TeamSegmentNode, TeamSegmentLink> {
    return (
      d3
        .forceSimulation<TeamSegmentNode>()
        .force(
          "link",
          d3.forceLink<TeamSegmentNode, TeamSegmentLink>() /*.distance(400)*/, // TODO WAT IS THIS????? N + 2
        )
        .force("charge", d3.forceManyBody().strength(-545))
        // .force("y", d3.forceY(this.bounds.y + this.bounds.height / 2).strength(0.7))
        .force(
          "collide",
          d3.forceCollide<TeamSegmentNode>((seg) => seg.players.length * PLAYER_HEIGHT),
        )
    );
    // .force("sameTeam", sameTeamForce().strength(0.8))
    // .force("diffTeam", differentTeamForce().strength(15));
  }

  public setupSimulation(onUpdate: () => void) {
    const teamMap = constructTeamMap(this.players);
    const [nodes, links] = getSimRawNodesLinks(teamMap);

    // Assign nodes/links to the sim
    this.sim.nodes(nodes);
    (this.sim.force("link") as d3.ForceLink<TeamSegmentNode, TeamSegmentLink>).links(links);

    this.sim.on("tick", onUpdate);
  }

  public getSimNodeRects(): [UIRectangle, UIText][] {
    return this.sim.nodes().map((node) => {
      return this.node2Rectangle(node);
    });
  }

  public getSimLinks(): UIConnector[] {
    return (this.sim.force("link") as d3.ForceLink<TeamSegmentNode, TeamSegmentLink>)
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
      });
  }
}
