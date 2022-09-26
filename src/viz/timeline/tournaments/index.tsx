import React, { useMemo } from "react";
import {
  CircleComponent,
  ConnectorComponent,
  LineComponent,
  RectComponent,
  TextComponent,
} from "../../../components";
import { Player, RlcsSeason } from "../../../types";
import { UIRectangle } from "../../../types/svg";
import { MARGIN, UIPlayer } from "../types";
import { DataProcessor } from "./processor";

export default function Timeline({
  seasons,
  teamColors,
  width,
  height,
}: {
  seasons: RlcsSeason[];
  teamColors: Record<string, string>;
  width: number;
  height: number;
}) {
  const bounds: UIRectangle = {
    x: MARGIN.left,
    y: MARGIN.top,
    width: width - MARGIN.left - MARGIN.right,
    height: height - MARGIN.top - MARGIN.bottom,
  };

  const processor = useMemo(
    () => new DataProcessor(seasons, teamColors, bounds),
    [seasons, teamColors],
  );

  const dates = useMemo(() => processor.getDates(), [processor]);

  return (
    <>
      <RectComponent {...bounds} />
      <g id="dates">
        {dates.map(([d, l], i) => (
          <React.Fragment key={i}>
            <TextComponent {...d} />
            <LineComponent {...l} />
          </React.Fragment>
        ))}
      </g>
      <g id="segments">
        {processor.getBundledSegments().map(([r, t], i) => (
          <React.Fragment key={i}>
            <RectComponent {...r} />
            <TextComponent {...t} />
          </React.Fragment>
        ))}
      </g>
    </>
  );
}
