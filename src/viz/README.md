# Visualizations

| File name                      | Description                                                                                   |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| [SimpleGraph](SimpleGraph.tsx) | Tournaments only, just list out teams and connect them by tournament                          |
| [ForceGraph](ForceGraph.tsx)   | Using forces (`d3-force`) to keep teams together and link people across tournaments           |
| [Sankey](Sankey.tsx)           | Uses a simple Sankey diagram (`d3-sankey`)                                                    |
| [Timeline](Timeline.tsx)       | Extends `SimpleGraph`. Linear timeline for all players that are involved in known tournaments |
| [Table](Table.tsx)             | Simple HTML table of players and their teams                                                  |
