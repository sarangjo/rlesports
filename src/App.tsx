import React from "react";
import Timeline from "./timeline";

import { PLAYERS } from "./data/sample/players2";
import { TEAM_COLORS } from "./data/sample/teamColors";
import { RectComponent } from "./components";

const WIDTH = 1200;
const HEIGHT = 800;

function App() {
  // const teamMap = process(PLAYERS.slice(0, 2));

  // for (const team in teamMap) {
  //   console.log(team + ": " + teamMap[team].toString());
  // }

  return (
    <>
      <h1>RL Esports</h1>
      <svg width={WIDTH} height={HEIGHT}>
        <RectComponent
          x={1}
          y={1}
          height={HEIGHT - 2}
          width={WIDTH - 2}
          color="orange"
        />
        <Timeline
          players={PLAYERS}
          teamColors={TEAM_COLORS}
          width={WIDTH}
          height={HEIGHT}
        />
      </svg>
    </>
  );
}

export default App;
