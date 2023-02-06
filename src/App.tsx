import { map } from "lodash";
import React, { useState } from "react";
import Tournaments from "./viz/Tournaments";
import Timeline from "./viz/timeline";
import Stats from "./stats";
import Sankey from "./viz/Sankey";
import Table from "./viz/table";
import ForceGraph from "./viz/forceGraph";

import { SEASONS } from "./data/sample/seasons";
import { PLAYERS } from "./data/sample/players";
import { TEAM_COLORS } from "./data/sample/team-colors";
import PlayerTeams from "./viz/PlayerTeams";
import { Viz, VizTitle } from "./types";
import TourneyTeams from "./viz/tourneyTeams";
import { processSeasons2 } from "./viz/SankeyTournaments";

function App() {
  const [view, setView] = useState(Viz.TOURNAMENTS);

  const handleChange = (e: any) => {
    console.log(e.target.value);
    setView(e.target.value);
  };

  console.log(processSeasons2(SEASONS));

  return (
    <div>
      <div style={{ textAlign: "center" }}>
        <select value={view} onChange={handleChange}>
          {map(Viz, (x) => (
            <option value={x} key={x}>
              {VizTitle[x]}
            </option>
          ))}
        </select>
        {/* <select value={map(regions, (r) => "" + r)} onChange={handleChangeRegion} multiple>
          {mapEnum(Region, (x, name) => (
            <option value={x} key={x}>
              {name}
            </option>
          ))}
        </select> */}
      </div>
      <div
        style={{
          width: "100%",
          height: "calc(100vh - 90px)",
          overflow: "scroll",
        }}
      >
        {view === Viz.TOURNAMENTS ? (
          <Tournaments seasons={SEASONS} />
        ) : view === Viz.TIMELINE ? (
          <Timeline players={PLAYERS} teamColors={TEAM_COLORS} />
        ) : view === Viz.TOURNEY_TEAMS ? (
          <TourneyTeams seasons={SEASONS} teamColors={TEAM_COLORS} />
        ) : view === Viz.TABLE ? (
          <Table seasons={SEASONS} players={PLAYERS} teamColors={TEAM_COLORS} />
        ) : view === Viz.FORCE_GRAPH ? (
          <ForceGraph seasons={SEASONS} />
        ) : view === Viz.TEXT ? (
          <Stats seasons={SEASONS} />
        ) : view === Viz.SANKEY ? (
          <Sankey seasons={SEASONS} />
        ) : (
          view === Viz.TEAM_MAP && <PlayerTeams players={PLAYERS} />
        )}
      </div>
    </div>
  );
}

export default App;
