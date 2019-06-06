console.log("hello there");

d3.csv("data/teams.csv").then(data => {
  data = data.reduce((acc, curr) => {
    acc.push({ date: curr.start_date, join: true, ...curr });
    if (curr.end_date) {
      acc.push({ date: curr.end_date, join: false, ...curr });
    }
    return acc;
  }, []);

  const min = d3.min(data, el => el.date);
  const max = d3.max(data, el => el.date);

  console.log(`min: ${min}, max: ${max}`);
});
