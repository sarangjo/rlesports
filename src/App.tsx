import React from "react";
import Visualization from "./viz";
import tournaments from "./data/tournaments.json";
import playerNames from "./data/playerNames.json";

function App() {
  return <Visualization tournaments={tournaments} playerNames={playerNames} />;
}

export default App;
