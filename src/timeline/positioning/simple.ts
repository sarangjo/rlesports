import { ScaleTime } from "d3-scale";
import { EventType, Player } from "../../types";
import {
  ConnectorType,
  TextAnchor,
  TextOrientation,
  UILine,
  UIPoint,
  UIRectangle,
} from "../../types/ui";
import { getIndices } from "../../util/data";
import { s2d } from "../../util/datetime";
import {
  COLOR_NO_TEAM,
  DEFAULT_COLOR,
  FILL_LEAVE,
  Radius,
  SPACING,
  STROKE_WIDTH_TEAM,
  UIPlayer,
} from "../types";

export function processPlayers(
  players: Player[],
  x: ScaleTime<number, number>,
  bounds: UIRectangle,
  teamColors: Record<string, string>
): UIPlayer[] {
  const indices = getIndices(players, (p) => p.name);
  const getY = (p: Player) =>
    bounds.y + SPACING + indices[p.name] * 2 * SPACING;

  return players.map((p) => processPlayer(p, x, getY, bounds, teamColors));
}

function processPlayer(
  p: Player,
  x: ScaleTime<number, number>,
  getY: (p: Player) => number,
  bounds: UIRectangle,
  teamColors: Record<string, string>
): UIPlayer {
  const uiP: UIPlayer = { events: [], memberships: [] };

  p.memberships.forEach((m, i) => {
    /* UI info for this m */

    const start: UIPoint = { x: x(s2d(m.join)), y: getY(p) };
    // If we have a leave, set that in the end point
    const end: UIPoint = {
      x: m.leave ? x(s2d(m.leave)) : bounds.x + bounds.width,
      y: getY(p),
    };
    const color = teamColors[m.team] || DEFAULT_COLOR;

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
            y: getY(p),
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
