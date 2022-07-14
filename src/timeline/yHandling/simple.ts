import { ScaleTime } from "d3-scale";
import { Player } from "../../types";
import { UIRectangle } from "../../types/ui";
import { getIndices } from "../../util/data";
import { s2d } from "../../util/datetime";
import { UIPlayer } from "../types";

class YScale {
  protected bounds: UIRectangle;

  constructor(bounds: UIRectangle) {
    this.bounds = bounds;
  }

  // TODO this signature finna be v interesting as we get more complex
  getY(_p: Player): number {
    throw new Error("Not implemented");
  }
}

export function processPlayers(
  players: Player[],
  x: ScaleTime<number, number>
): UIPlayer[] {
  return players.map((p) => processPlayer(p, x));
}

/**
 * Simple Y Scale: just uses indices to stack players vertically.
 */
class SimpleYScale extends YScale {
  private indices: Record<string, number>;

  constructor(players: Player[], bounds: UIRectangle) {
    super(bounds);

    this.indices = getIndices(players, (p) => p.name);
  }

  override getY(p: Player): number {
    // Given a vertical index, what's its Y coordinate?
    return this.bounds.y + SPACING + this.indices[p.name] * 2 * SPACING;
  }
}

function processPlayer(p: Player, x: ScaleTime<number, number>): UIPlayer {
  const uiP: UIPlayer = { events: [], memberships: [] };

  p.memberships.forEach((m, i) => {
    /* UI info for this m */

    const start: UIPoint = { x: x(s2d(m.join)), y: this.y.getY(p) };
    // If we have a leave, set that in the end point
    const end: UIPoint = {
      x: m.leave ? x(s2d(m.leave)) : this.bounds.x + this.bounds.width,
      y: this.y.getY(p),
    };
    const color = this.teamColors[m.team] || DEFAULT_COLOR;

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
        uiP.memberships.push({
          connectorType: ConnectorType.LINE,
          start: end,
          end: {
            x: x(s2d(p.memberships[i + 1].join)),
            y: this.y.getY(p),
          },
          stroke: COLOR_NO_TEAM,
        } as UILine);
      }
    }

    // Membership
    uiP.memberships.push({
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
        x: start.x - SPACING,
        y: start.y + SPACING / 2, // TODO arbitrary 5px adjustment
        anchor: TextAnchor.END,
        orientation: TextOrientation.HORIZONTAL,
      };
    }
  });

  return uiP;
}
