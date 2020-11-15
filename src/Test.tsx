import { map } from "lodash";
import React, { useState } from "react";
import { scaleTimeDisjoint } from "./util";

export default function Test() {
  const domain: Array<[string, string]> = [
    ["2020-01-01", "2020-01-10"],
    ["2020-02-01", "2020-02-20"],
  ];
  const range: [number, number] = [0, 30];

  const [input, setInput] = useState("2020-01-01");
  const [output, setOutput] = useState(0);

  const compute = () => {
    setOutput(scaleTimeDisjoint(domain, range, input));
  };

  return (
    <div>
      <ul>
        <li>
          Domain:
          <ul>
            {map(domain, (r) => (
              <li>{JSON.stringify(r)}</li>
            ))}
          </ul>
        </li>
        <li>Range: {JSON.stringify(range)}</li>
      </ul>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={compute}>CLlick</button>
      <b>Output: {output}</b>
    </div>
  );
}
