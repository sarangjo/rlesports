import sys
import requests
import json
from typing import Dict, Any

API_BASE = "https://liquipedia.net/rocketleague/api.php"
DEFAULT_PARAMS = {"origin": "*", "format": "json"}
USER_AGENT = "RL Esports Visualization"


def get_section(page: str, section: int):
    try:
        wiki_text = call_api({
            "action": "parse",
            "prop": "wikitext",
            "page": page,
            "section": section,
        })
        return wiki_text['parse']
    except KeyError:
        return {}


def get_sections(page: str):
    try:
        wiki_text = call_api({
            "action": "parse",
            "prop": "sections",
            "page": page,
        })
        return wiki_text['parse']['sections']
    except KeyError:
        return []


def call_api(opts: Dict[str, Any]):
    opts.update(DEFAULT_PARAMS)
    req = requests.get(API_BASE, params=opts, headers={
                       'user-agent': USER_AGENT})
    try:
        return json.loads(req.text)
    except json.decoder.JSONDecodeError:
        print(req.text)
        sys.exit(1)
