import { EventType } from "../types";
import { Color, UICircle, UIConnector, UIText } from "../types/ui";

/* UI */

export const SPACING = 10;
export const DEFAULT_COLOR = "#000";
export const FILL_LEAVE: Color = "transparent";
export const COLOR_NO_TEAM: Color = "#bbbbbb";
export const STROKE_WIDTH_TEAM = 3;

export const Radius = {
  [EventType.JOIN]: 4,
  [EventType.LEAVE]: 6,
};

// export interface UIPlayerEvent extends UIPoint {
//   color: Color;
//   eventType: EventType;
// }

// export interface UIMembership extends UISegment {
//   color?: Color;
//   membershipType: MembershipType;
// }

// TODO: there's no requirements that the coordinates of the events and segments line up whatsoever. Problem?
export interface UIPlayer {
  name?: UIText;
  events: UICircle[];
  memberships: UIConnector[];

  // events: UIPlayerEvent[];
  // memberships: UIMembership[];
}
