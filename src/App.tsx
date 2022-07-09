import React from "react";
import Timeline from "./timeline";
import { UIRectangle } from "./types/ui";

const BOUNDS: UIRectangle = { x: 50, y: 50, width: 1000, height: 800 };

function App() {
  return (
    <svg width={BOUNDS.x + BOUNDS.width} height={BOUNDS.y + BOUNDS.height}>
      <Timeline players={[]} teamColors={{}} bounds={BOUNDS} />
    </svg>
  );
}

export default App;
