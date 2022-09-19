import React from "react";
import { CircleComponent, ConnectorComponent, TextComponent } from "../../../components";
import { Player } from "../../../types";
import { UIRectangle } from "../../../types/svg";
import { MARGIN, UIPlayer } from "../types";

export default function Timeline({
  seasons,
  teamColors,
  width,
  height,
}: {
  players: Player[];
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
}
