// Constants
const WIDTH = 1600;
const HEIGHT = 1000;
const CIRCLE_RADIUS = 10;

//// GLOBAL STATE ////

// Raw data
let teams;
let tournaments;

// Computed data points
let rosterMoves, playerEdges;
let min;
let max;

// Functions that will be assigned
let x;

d3.csv("data/teams.csv")
  .then(data => {
    teams = data;
    const processedData = processTeams(data);
    rosterMoves = processedData.rosterMoves;
    playerEdges = processedData.playerEdges;
    min = _.minBy(rosterMoves, "date");
    max = _.maxBy(rosterMoves, "date");

    return d3.csv("data/tournaments.csv");
  })
  .then(data => {
    tournaments = data;

    // TODO process
  })
  .then(() => {
    onDataLoaded();
  });

// Returns roster moves and player edges
function processTeams(data) {
  rosterMoves = [];
  playerEdges = [];
  data.forEach(curr => {
    // Effectively filter out bad data points
    if (!curr.start_date) {
      console.log("Ignoring invalid data point", curr);
      return;
    }

    // Add to roster moves
    rosterMoves.push({ date: curr.start_date, join: true, ...curr });
    if (curr.end_date) {
      rosterMoves.push({ date: curr.end_date, join: false, ...curr });

      // Add to playerEdges
      playerEdges.push({
        start: rosterMoves.length - 2,
        end: rosterMoves.length - 1,
      });
    }
  });

  return {
    rosterMoves,
    playerEdges,
  };
}

function onDataLoaded() {
  const baseX = d3
    .scaleLinear()
    .domain([0, moment(max.date).diff(min.date, "d")])
    .range([CIRCLE_RADIUS, WIDTH - CIRCLE_RADIUS]);
  x = date => baseX(moment(date).diff(min.date, "d"));

  const chart = d3
    .select(".chart")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

  const circles = chart
    .selectAll("circle")
    .data(rosterMoves)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.date))
    .attr("cy", () => CIRCLE_RADIUS + Math.random() * (HEIGHT - 2 * CIRCLE_RADIUS))
    .attr("r", CIRCLE_RADIUS);
}
