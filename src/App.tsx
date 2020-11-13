import { filter, find, map, size, slice, sortBy } from "lodash";
import React, { useEffect, useState } from "react";
import players from "./data/players-bad.json";
import { OldTournament, Player, Region } from "./types";
import { mapEnum, Viz, VizTitle } from "./util";
import ForceGraph from "./viz/ForceGraph";
import PlayerTeams from "./viz/PlayerTeams";
import Sankey from "./viz/Sankey";
import SimpleGraph from "./viz/SimpleGraph";
import Table from "./viz/Table";
import Text from "./viz/Text";
import Timeline from "./viz/Timeline";

import events from "./data/players.json";
import teams from "./data/teams.json";
import seasons from "./data/tournaments.json";

function App() {
  const [tournaments, setTournaments] = useState<OldTournament[]>([]);
  const [view, setView] = useState(Viz.TABLE);
  const [regions, setRegions] = useState([Region.NORTH_AMERICA, Region.WORLD, Region.EUROPE]);

  useEffect(() => {
    const get = async () => {
      const result = await fetch("http://localhost:5002/api/tournaments");
      const allTournaments: OldTournament[] = await result.json();
      const sorted = allTournaments.sort((a, b) =>
        (a.start || "") > (b.start || "") ? 1 : (a.start || "") < (b.start || "") ? -1 : 0,
      );

      setTournaments(filter(sorted, (t) => t.season === "1"));
    };
    get();
  }, []);

  const handleChange = (e: any) => {
    setView(e.target.value);
  };

  const handleChangeRegion = (e: any) => {
    setRegions(
      map(
        [...e.target.options].filter((o) => o.selected).map((o) => o.value),
        (s) => +s,
      ),
    );
  };

  const chosenTournaments = filter(tournaments, (t) => !!find(regions, (r) => r === t.region));

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
        <select value={map(regions, (r) => "" + r)} onChange={handleChangeRegion} multiple>
          {mapEnum(Region, (x, name) => (
            <option value={x} key={x}>
              {name}
            </option>
          ))}
        </select>
      </div>
      {view === Viz.SIMPLE ? (
        <SimpleGraph tournaments={chosenTournaments} />
      ) : view === Viz.FORCE_GRAPH ? (
        <ForceGraph tournaments={chosenTournaments} />
      ) : view === Viz.SANKEY ? (
        <Sankey tournaments={chosenTournaments} />
      ) : view === Viz.TEAM_MAP ? (
        <PlayerTeams players={players} />
      ) : view === Viz.TABLE ? (
        <Table seasons={seasons} players={events} teams={teams} />
      ) : view === Viz.TEXT ? (
        <Text tournaments={chosenTournaments} />
      ) : view === Viz.TIMELINE ? (
        <Timeline
          tournaments={chosenTournaments}
          events={events as Player[]}
          teams={(teams as unknown) as Record<string, string>}
        />
      ) : (
        ""
      )}
    </div>
  );
}

export default App;
