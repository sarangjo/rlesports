# rlesports-viz

Visualization of Rocket League's eSports scene.

## Development

```
$ yarn
$ yarn start
```

## Visual Design [eventual]

| Visualization                           | Data point                       |
| --------------------------------------- | -------------------------------- |
| horizontal line                         | player                           |
| vertical line (maybe not visible)       | team formation                   |
| dot type 1 (cross)                      | act of joining or leaving a team |
| dot type 2 (lighter cross)              | temporary join/leave             |
| parallel horizontal lines tightly bound | players in a team                |
| ^ bold                                  | existing team formation          |
| ^ golden glow                           | winners of tournament            |
| rectangle encompassing multiple teams   | tournament                       |
| x axis                                  | time                             |
| y axis                                  | free for convenience             |

## Data

The data for the visualization is fetched from [Liquipedia](https://liquipedia.net/rocketleague). `data/get_data.py` performs the fetching and processing of data. `data/cache.json` is a cache of the fetched results from Liquipedia to avoid duplicate requests. `get_data.py` outputs the processed data to `data/tournaments.json`, which d3 then processes to create the visualization.

If you want to look at the processed data without running the Python script, switch to the `gh-pages` branch, which has the full generated `data/tournaments.json` file.

The processed data is a list of tournaments. Each tournament comprises teams of at least 3 players/subs.
