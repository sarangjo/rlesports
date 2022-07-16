import React from "react";
import {
  ConnectorType,
  TextOrientation,
  UICircle,
  UIConnector,
  UILine,
  UIRectangle,
  UIText,
} from "../types/svg";

export const TextComponent = (t: UIText) => (
  <text
    x={t.x}
    y={t.y}
    {...(t.orientation === TextOrientation.VERTICAL && {
      transform: `rotate(90,${t.x},${t.y})`,
      // textLength={(d.y1 || 0) - (d.y0 || 0)}
      // lengthAdjust="spacing"
    })}
    {...(t.anchor && { textAnchor: t.anchor })}
  >
    {t.text}
  </text>
);

export const LineComponent = (s: UILine) => (
  <line
    x1={s.start.x}
    y1={s.start.y}
    x2={s.end.x}
    y2={s.end.y}
    stroke={s.stroke}
    strokeWidth={s.strokeWidth}
  />
);

export const ConnectorComponent = (s: UIConnector) => {
  switch (s.connectorType) {
    case ConnectorType.LINE:
    default:
      return <LineComponent {...s} />;
  }
};

export const CircleComponent = (c: UICircle) => (
  <circle cx={c.center.x} cy={c.center.y} r={c.radius} stroke={c.stroke} fill={c.fill} />
);

export const RectComponent = (r: UIRectangle) => (
  <rect {...r} stroke={r.color || "black"} fill="transparent" />
);
