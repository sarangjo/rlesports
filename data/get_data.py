import pprint
import json
from typing import List, Any, Dict
import requests

API_BASE = "https://liquipedia.net/rocketleague/api.php"

DEFAULT_PARAMS = {"origin": "*", "format": "json"}

PREFIX = "Rocket League Championship Series/Season "
REGION = "North America"

pp = pprint.PrettyPrinter(indent=2)

tournamentNames: List[str] = [
    f"{PREFIX}1/{REGION}/Qualifier 1",
    f"{PREFIX}1/{REGION}/Qualifier 2",
    f"{PREFIX}1",
    f"{PREFIX}2/{REGION},"
    f"{PREFIX}2",
    f"{PREFIX}3/{REGION},"
    f"{PREFIX}3",
    f"{PREFIX}4/{REGION},"
    f"{PREFIX}4",
    f"{PREFIX}5/{REGION},"
    f"{PREFIX}5",
    f"{PREFIX}6/{REGION},"
    f"{PREFIX}6",
]

participantsSections: List[int] = []

"""
const wiki = (params: Record<string, any>) =>
  fetch(`${API_BASE}?${qs.stringify(_.assign(params, DEFAULT_PARAMS))}`, {
    credentials: "same-origin",
    mode: "cors",
  }).then(res => res.json());

// ?action=parse&prop=wikitext&page=Rocket League Championship Series/Season 1/North America/Qualifier 1&format=json&section=3";
tournamentNames = [
  [
    "Rocket League Championship Series/Season 1/North America/Qualifier 1",
    "Rocket League Championship Series/Season 1/North America/Qualifier 2",
    "Rocket League Championship Series/Season 1",
  ],
  _.range(2, 7).map(seasonNumber => [
    `Rocket League Championship Series/Season ${seasonNumber}/North America`,
    `Rocket League Championship Series/Season ${seasonNumber}`,
  ]),
]

console.log(tournamentNames);

export const getTournamentData = async (t: string) => {
  const data = await wiki({
    action: "parse",
    prop: "wikitext",
    page: t,
    section: 3,
  });

  if (_.has(data, "parse.wikitext.*")) {
    console.log("response for", t, data);

    const text = data.parse.wikitext["*"];

    console.log(
      "wtf'd data for",
      t,
      _.filter(wtf(text).data.sections[0].data.templates, template => template.team),
    );
  } else {
    console.log("no wikitext for", t, data);
  }
};
"""


def call_api(opts: Dict[str, Any]):
    opts.update(DEFAULT_PARAMS)
    return json.loads(requests.get(API_BASE, opts).text)


def get_data():
    for (i, t) in enumerate(tournamentNames):
        # Get sections and find "Participants"
        sections = call_api({
            "action": "parse",
            "prop": "sections",
            "page": t,
        })
        pSection = next(s for s in sections['parse']['sections'] if s['line'] == 'Participants')

        requests.get(API_BASE, {
            **DEFAULT_PARAMS,

            "action": "parse",
            "prop": "wikitext",
            "page": t,
            "section": int(pSection['index']),
        })

    pp.pprint(participantsSections)


def main():
    get_data()


if __name__ == '__main__':
    main()
