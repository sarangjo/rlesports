import { EventType, MembershipType } from "../types";
import { Color, UIPoint, UISegment } from "../types/ui";

/* UI */

export const SPACING = 10;

export interface UIPlayerEvent extends UIPoint {
  color: Color;
  eventType: EventType;
}

export interface UIMembership extends UISegment {
  color?: Color;
  membershipType: MembershipType;
}

// TODO: there's no requirements that the coordinates of the events and segments line up whatsoever. Problem?
export interface UIPlayer {
  events: UIPlayerEvent[];
  memberships: UIMembership[];
}

