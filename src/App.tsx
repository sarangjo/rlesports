import React from "react";
import Timeline from "./timeline";
import { UIRectangle } from "./types/ui";

import { PLAYERS } from "./data/sample/players";
import { TEAM_COLORS } from "./data/sample/teamColors";

const WIDTH = 1200;
const HEIGHT = 800;

function App() {
  return (
    <svg width={WIDTH} height={HEIGHT}>
      <Timeline players={PLAYERS} teamColors={TEAM_COLORS} width={WIDTH} height={HEIGHT} />
    </svg>
  );
}

export default App;
