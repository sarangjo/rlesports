import React from "react";
import Timeline from "./timeline";

import { PLAYERS } from "./data/sample/players";
import { TEAM_COLORS } from "./data/sample/teamColors";
import { RectComponent } from "./components";
import { SortedArray } from "./util/sortedArray";

const WIDTH = 1200;
const HEIGHT = 800;

function App() {
  const s = new SortedArray<{ a: number }>(
    [{ a: 1 }],
    (x, y) => x.a === y.a,
    (x, y) => x.a - y.a
  );

  s.insert({ a: 2 });
  s.insert({ a: -1 });

  console.log(s.toArray());

  const teamMap = process(PLAYERS.slice(0, 2));

  for (const team in teamMap) {
    console.log(team + ": " + teamMap[team].toString());
  }

  return (
    <>
      <h1>RL Esports</h1>
      <svg width={WIDTH} height={HEIGHT}>
        <RectComponent x={1} y={1} height={HEIGHT - 2} width={WIDTH - 2} color="orange" />
        <Timeline players={PLAYERS} teamColors={TEAM_COLORS} width={WIDTH} height={HEIGHT} />
      </svg>
    </>
  );
}

export default App;
