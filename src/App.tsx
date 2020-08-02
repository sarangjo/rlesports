import { map, size, slice, sortBy } from "lodash";
import React, { useEffect, useState } from "react";
import "./App.css";
import players from "./data/players.json";
import { Tournament } from "./types";
import { Viz, VizTitle } from "./util";
import ForceGraph from "./viz/ForceGraph";
import PlayerTeams from "./viz/PlayerTeams";
import Sankey from "./viz/Sankey";
import SimpleGraph from "./viz/SimpleGraph";
import Table from "./viz/Table";

function App() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [view, setView] = useState(Viz.SANKEY);

  useEffect(() => {
    const get = async () => {
      const result = await fetch("http://localhost:5002/api/tournaments");
      const allTournaments: Tournament[] = await result.json();
      const sorted = allTournaments.sort((a, b) =>
        (a.start || "") > (b.start || "") ? 1 : (a.start || "") < (b.start || "") ? -1 : 0,
      );
      console.log(sorted);

      setTournaments(slice(allTournaments, 0, 4));
    };
    get();
  }, []);

  const handleChange = (e: any) => {
    setView(e.target.value);
  };

  return (
    <div className="App">
      <div>
        <select value={view} onChange={handleChange}>
          {map(Viz, (x) => (
            <option value={x} key={x}>
              {VizTitle[x]}
            </option>
          ))}
        </select>
      </div>
      {view === Viz.SIMPLE ? (
        <SimpleGraph tournaments={tournaments} />
      ) : view === Viz.FORCE_GRAPH ? (
        <ForceGraph tournaments={tournaments} />
      ) : view === Viz.SANKEY ? (
        <Sankey tournaments={tournaments} />
      ) : view === Viz.TEAM_MAP ? (
        <PlayerTeams players={players} />
      ) : view === Viz.TABLE ? (
        <Table tournaments={tournaments} />
      ) : (
        ""
      )}
    </div>
  );
}

export default App;
