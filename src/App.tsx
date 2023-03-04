import { map } from "lodash";
import React, { useState } from "react";

import { Viz, VizTitle } from "./types";
import VizComponent from "./viz";

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
        <VizComponent />
      </div>
    </div>
  );
}

export default App;
