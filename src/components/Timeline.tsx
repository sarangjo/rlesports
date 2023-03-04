import React, { PropsWithChildren } from "react";
import { RectComponent, TextComponent, LineComponent, ConnectorComponent } from ".";
import { WIDTH, HEIGHT } from "../constants";
import { UIText, UILine } from "../types/svg";
import { TIMELINE_BOUNDS } from "../util/timeline";

interface Props {
  dates: [UIText, UILine][];
}

export default function Timeline({ dates, children }: PropsWithChildren<Props>) {
  return (
    <svg width={WIDTH} height={HEIGHT}>
      <RectComponent {...TIMELINE_BOUNDS} />
      <g id="dates">
        {dates.map(([d, l], i) => (
          <React.Fragment key={i}>
            <TextComponent {...d} />
            <LineComponent {...l} />
          </React.Fragment>
        ))}
      </g>
      {children}
    </svg>
  );
}
