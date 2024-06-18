export const tournamentShortName = (n: string) =>
  Array.from(n).reduce((acc, cur) => {
    return (cur >= "A" && cur <= "Z") || (cur >= "0" && cur <= "9") ? acc + cur : acc;
  }, "");
