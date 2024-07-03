export const tournamentShortName = (n: string) =>
  Array.from(n).reduce((acc, cur) => {
    if ((cur >= "A" && cur <= "Z") || (cur >= "0" && cur <= "9")) {
      return acc + cur;
    }
    if (cur == "/") {
      return acc + " ";
    }
    return acc;
  }, "");
