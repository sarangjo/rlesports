import React from "react";
import { EventType, MembershipType, Player } from "../types";
import {
  Color,
  SegmentType,
  UIRectangle,
} from "../types/ui";
import { DataProcessor } from "./data";
import { UIPlayer } from "./types";

const Radius = {
  [EventType.JOIN]: 4,
  [EventType.LEAVE]: 6,
};

const FILL_LEAVE: Color = "transparent";
const COLOR_NO_TEAM: Color = "#bbbbbb";
const STROKE_WIDTH_TEAM = 3;

function PlayerComponent({ player }: { player: UIPlayer }) {
  // Segments
  const segments = player.memberships.map(
    (s, i) =>
      s.segmentType === SegmentType.LINE && (
        <line
          key={i}
          x1={s.start.x}
          y1={s.start.y}
          x2={s.end.x}
          y2={s.end.y}
          stroke={s.color || COLOR_NO_TEAM}
          {...(s.membershipType === MembershipType.MEMBER
            ? { strokeWidth: STROKE_WIDTH_TEAM }
            : undefined)}
        />
      )
  );

  // Events
  const events = player.events.map((e, i) => (
    <circle
      key={i}
      cx={e.x}
      cy={e.y}
      r={Radius[EventType.JOIN]}
      stroke={e.color}
      fill={e.eventType === EventType.JOIN ?  e.color : FILL_LEAVE}
    />
  ));

  return (
    <>
      {segments}
      {events}
    </>
  );
}

export default function TimelineComponent({
  players,
  teamColors,
  bounds,
}: {
  players: Player[];
  teamColors: Record<string, string>;
  bounds: UIRectangle;
}) {
  // Players
  const processor = new DataProcessor(players, teamColors, bounds);
  const uiPlayers = processor.process();

  return (
    <>
      <g id="players">
        {uiPlayers?.map((p) => (
          <PlayerComponent player={p} />
        ))}
      </g>
    </>
  );
}
