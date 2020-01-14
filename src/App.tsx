import React, { useState } from "react";

import TimelineViz from "./visualizations/Timeline";

import data from "./data/test.json";

const App: React.FC = () => {
  const [date, setDate] = useState("2019-10-10");

  return (
    <div>
      <h1>Welcome to RL Esports!</h1>
      <div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <TimelineViz initialData={data} date={date} />
    </div>
  );
};

export default App;
