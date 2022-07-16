import { map } from "lodash";
import React, { useState } from "react";
import { Viz, VizTitle } from "./util";
import Tournaments from "./viz/Tournaments";
import Timeline from "./viz/timeline";
import Stats from "./stats";
import Sankey from "./viz/Sankey";
import Table from "./viz/table/Table";
import ForceGraph from "./viz/ForceGraph";

// import events from "./data/players.json";
// import teams from "./data/teams.json";

import { SEASONS } from "./data/sample/seasons";
import { PLAYERS } from "./data/sample/players";
import { TEAM_COLORS } from "./data/sample/team-colors";
import PlayerTeams from "./viz/PlayerTeams";

const WIDTH = 1200;
const HEIGHT = 800;

function App() {
  const [view, setView] = useState(Viz.TIMELINE);

  const handleChange = (e: any) => {
    console.log(e.target.value);
    setView(e.target.value);
  };

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
        {
          view === Viz.TOURNAMENTS ? (
            <Tournaments seasons={SEASONS} />
          ) : view === Viz.TIMELINE ? (
            <svg width={WIDTH} height={HEIGHT}>
              <Timeline players={PLAYERS} teamColors={TEAM_COLORS} height={HEIGHT} width={WIDTH} />
            </svg>
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
          ) /*

        ) : view === Viz.TEAM_MAP ? (
          "Hello"
        ) : // <PlayerTeams players={players} />
        ) : view === Viz.TEXT ? (
          <Text tournaments={chosenTournaments} />
        ) : view === Viz.TIMELINE ? (
          <Timeline seasons={seasons} players={events} teams={teams} />
        ) : (
          ""
        )*/
        }
      </div>
    </div>
  );
}

export default App;
