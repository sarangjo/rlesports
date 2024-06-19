interface RGBColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

const dig3 = (hex: string) => ({
  r: parseInt(hex[1] + hex[1], 16),
  g: parseInt(hex[2] + hex[2], 16),
  b: parseInt(hex[3] + hex[3], 16),
});

export const hexToColor = (hex: string): RGBColor => {
  hex = hex || "#fff";
  // 3 digits
  if (hex.length === 4) {
    return dig3(hex);
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

  return dig3("#fff");
};

// https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color
export function getColorByBackground(hex: string) {
  const c = hexToColor(hex);
  return c.r * 0.299 + c.g * 0.587 + c.b * 0.114 > 156 ? "#000" : "#fff";
}

export const colorNormalizer = (c: string | undefined): string => c || "#fff";
