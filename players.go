package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
)

/*
import json
import re
import time
from typing import List, Dict, Any
import os.path

from api import call_api

DIR = os.path.dirname(__file__)

PLAYERS_CACHE_FILE = os.path.join(DIR, "..", "cache", "pcache.json")
PLAYERS_FILE = os.path.join(DIR, "frontend", "data", "players.json")


def get_players_data(players: List[str]) -> Dict[str, Dict]:
    for player in players:
        with open(PLAYERS_CACHE_FILE, 'r') as f:
            output = json.load(f)
        if player not in output:
            wiki_text = call_api({
                "action": "parse",
                "prop": "wikitext",
                "page": player,
                "format": "json",
                "section": 0,
            })
            print("called api for", player)
            output[player] = wiki_text['parse']
            with open(PLAYERS_CACHE_FILE, 'w') as f:
                json.dump(output, f, indent=2)
            time.sleep(30)
        else:
            print("didn't need api for", player)

    with open(PLAYERS_CACHE_FILE) as f:
        output = json.load(f)
    return output


DATE_RE = re.compile(r"[\w?]{4}-[\w?]{2}-[\w?]{2}")


def process_players_data(output: Dict[str, Dict]):
    """
    Go through the wikitext output and process it into a clean JSON format
    """
    processed = []
    for player in output:
        lines: List[str] = output[player]["wikitext"]["*"].split('\n')

        player = {
            "events": []
        }
        in_infobox = False
        in_history = False
        for line in lines:
            if line.startswith('{{Infobox'):
                in_infobox = True
            elif in_infobox:
                if line.startswith('|id='):
                    player["name"] = line.replace('|id=', '')

            if not in_history and line.startswith('|history'):
                in_history = True
            elif in_history:
                if not line.startswith('{{TH'):
                    break

                parts = line.replace('{{', '').replace('}}', '').split('|')
                dates = parts[1].split(' ')
                event = {
                    "start": dates[0],
                    "team": parts[2],
                }
                if re.match(DATE_RE, dates[-1]):
                    event["end"] = dates[-1]
                player["events"].append(event)

        processed.append(player)

    with open(PLAYERS_FILE, 'w') as f:
        json.dump(processed, f, indent=2)

	return processed
*/

// Event is a team membership for a player
type Event struct {
	Start string `json:"start"`
	End   string `json:"end"`
	Team  string `json:"team"`
}

// Player has a name and set of events
type Player struct {
	Events []Event `json:"events"`
	Name   string  `json:"name"`
}

const playersCacheFile = "cache/pcache.json"
const dateRegex = "[\\w?]{4}-[\\w?]{2}-[\\w?]{2}"

// GetPlayersData gets player data
func GetPlayersData(players []string) (output map[string]interface{}) {
	file, err := os.Open(playersCacheFile)
	if err != nil {
		fmt.Println("Unable to open db file", err)
		output = make(map[string]interface{})
	} else {
		byteValue, err := ioutil.ReadAll(file)
		if err != nil {
			fmt.Println("Unable to read file", err)
			os.Exit(1)
		}
		json.Unmarshal(byteValue, &output)
		file.Close()
	}

	for _, player := range players {
		if _, ok := output[player]; !ok {
			output[player] = GetPlayer(player)
		}
	}

	outputBytes, err := json.MarshalIndent(output, "", "  ")
	if err != nil {
		fmt.Println("Unable to marshal output", err)
		os.Exit(1)
	}
	err = ioutil.WriteFile(playersCacheFile, outputBytes, 0644)
	if err != nil {
		fmt.Println("Unable to write out tournaments cache file", err)
		os.Exit(1)
	}

	return output
}

// ProcessPlayersData processes the wikitext from GetPlayersData and produces a list of Players
func ProcessPlayersData(output map[string]interface{}) {
	players := make([]Player, 0, len(output))

	for _, playerData := range output {
		wikitext := playerData.(map[string]interface{})["wikitext"].(map[string]interface{})["*"].(string)
		player := ParsePlayer(wikitext)
		players = append(players, player)
	}
}
