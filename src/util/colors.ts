import { Color } from "../types/ui";

// Colors
export const COLOR_NO_TEAM: Color = "#bbbbbb";

const COLOR_UNKNOWN_TEAM = "#232323";

export const getTeamColor = (team: string, teams: Record<string, string>) =>
  team in teams ? teams[team] : COLOR_UNKNOWN_TEAM;

export const WHITE = "#fff";

export const hexToColor = (hex: string): { r: number; g: number; b: number; a?: number } => {
  hex = hex || WHITE;
  // 3 digits
  if (hex.length === 4) {
    return {
      r: parseInt(hex[1] + hex[1], 16),
      g: parseInt(hex[2] + hex[2], 16),
      b: parseInt(hex[3] + hex[3], 16),
    };
    // 4 digits
  } else if (hex.length === 5) {
    return {
      r: parseInt(hex[1] + hex[1], 16),
      g: parseInt(hex[2] + hex[2], 16),
      b: parseInt(hex[3] + hex[3], 16),
      a: parseInt(hex[4] + hex[4], 16),
    };
    // 6 digits
  } else if (hex.length === 7) {
    return {
      r: parseInt(hex[1] + hex[2], 16),
      g: parseInt(hex[3] + hex[4], 16),
      b: parseInt(hex[5] + hex[6], 16),
    };
  }
  return { r: 0, g: 0, b: 0 };
};

// FIXME Find the Stack Overflow answer that gave me this arbitrary formula
export function getColorByBackground(hex: string) {
  const c = hexToColor(hex);
  return c.r * 0.299 + c.g * 0.587 + c.b * 0.114 > 186 ? "#000" : "#fff";
}
