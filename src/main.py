import copy
import os.path
import json
import re
import sys
from typing import List, Any, Dict
import time

import requests

from api import call_api
from tournaments import get_tournaments_data, process_tournaments_data, upload_tournaments_data
from players import get_players_data, process_players_data


def main():
    try:
        datatype = input("t for tournaments, p for players ")
        if datatype == "t":
            output = get_tournaments_data()
            processed = process_tournaments_data(output)
            upload_tournaments_data(processed)
        elif datatype == "p":
            with open(os.path.join(os.path.dirname(__file__), "playerlist.json")) as f:
                players = json.load(f)
            output = get_players_data(players)
            process_players_data(output)
    except Exception as err:
        print("bye, error:", err)


if __name__ == '__main__':
    main()
