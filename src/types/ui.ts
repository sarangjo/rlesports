// TOOD rpeleace with better type
export type Color = string;

export interface UIPoint {
  x: number;
  y: number;
}

export enum SegmentType {
  LINE,
}

export interface UISegment {
  start: UIPoint;
  end: UIPoint;
  segmentType: SegmentType;
}

export interface UIRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}
