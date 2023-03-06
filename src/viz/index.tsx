import React from "react";
import Timeline from "../components/Timeline";
import { processSeasons2 } from "./processor";
import { SEASONS } from "../data/sample/seasons";

const nodes = processSeasons2(SEASONS);

const NodeComponent = () => {
  return;
};

export default function VizComponent() {
  return <Timeline dates={dates}></Timeline>;
}
