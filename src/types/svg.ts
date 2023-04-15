/* SVG library types */

// TOOD replace with better type
export type Color = string;

export interface UIPoint {
  x: number;
  y: number;
}

export interface UIRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  stroke?: string;
  fill?: string;
}

export enum TextOrientation {
  HORIZONTAL,
  VERTICAL,
}

export enum TextAnchor {
  END = "end",
}

export interface UIText extends UIPoint {
  text: string;
  anchor?: TextAnchor;
  orientation: TextOrientation;
}

export interface UICircle {
  center: UIPoint;
  radius: number;
  stroke?: string;
  fill?: string;
}

export enum ConnectorType {
  LINE,
}

export interface UIConnector {
  start: UIPoint;
  end: UIPoint;
  stroke?: string;
  strokeWidth?: number;
  connectorType: ConnectorType;
}

export interface UILine extends UIConnector {
  connectorType: ConnectorType.LINE;
}
