console.log("hello there");

let teams;
let tournaments;

d3.csv("data/teams.csv")
  .then(data => {
    teams = data.reduce((acc, curr) => {
      acc.push({ date: curr.start_date, join: true, ...curr });
      if (curr.end_date) {
        acc.push({ date: curr.end_date, join: false, ...curr });
      }
      return acc;
    }, []);

    return d3.csv("data/tournaments.csv");
  })
  .then(data => {
    tournaments = data;
  })
  .then(() => {
    const min = d3.min(teams, el => el.date);
    const max = d3.max(teams, el => el.date);

    console.log(`min: ${min}, max: ${max}`);
  });
