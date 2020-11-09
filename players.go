package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"strings"
)

const playersCacheFile = "cache/pcache.json"
const eventsOutputFile = "src/data/events.json"

func getCache() map[string]interface{} {
	file, err := os.Open(playersCacheFile)
	if err != nil {
		fmt.Println("Unable to open db file", err)
		return make(map[string]interface{})
	}
	byteValue, err := ioutil.ReadAll(file)
	if err != nil {
		fmt.Println("Unable to read file", err)
		os.Exit(1)
	}
	var output map[string]interface{}
	json.Unmarshal(byteValue, &output)
	file.Close()
	return output
}

// CachePlayersData fetches and saves player data of the players specified
func CachePlayersData(players []string) map[string]interface{} {
	output := getCache()
	for _, player := range players {
		if _, ok := output[player]; !ok {
			output[player] = FetchPlayer(player)
		}
	}
	if WriteJSONFile(output, playersCacheFile) != nil {
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

func getPlayerDetails(name string) Player {
	output := getCache()

	var playerData interface{}
	var ok bool
	if playerData, ok = output[name]; !ok {
		// Need to fetch and persist
		playerData = FetchPlayer(name)
		output[name] = playerData
		if WriteJSONFile(output, playersCacheFile) != nil {
			os.Exit(1)
		}
	}

	return ParsePlayer(playerData.(map[string]interface{})["wikitext"].(map[string]interface{})["*"].(string))
}

func membershipInTournaments(name string, membership Membership, tournaments []Tournament) bool {
	for _, t := range tournaments {
		if membership.Join < t.End && (membership.Leave == "" || membership.Leave > t.Start) {
			// Don't care about team name cuz they could be acquired; purely player-based. This could
			// be flawed if Liquipedia doesn't show members that may not be there at the end of the
			// tournament (i.e. due to leaving/joining mid-tournament)
			for _, team := range t.Teams {
				for _, p := range team.Players {
					if p == name {
						return true
					}
				}
			}
		}
	}
	return false
}

// CacheVerify verifies cache integrity
func CacheVerify() {
	cache := getCache()

	uniqueNames := make(map[string]bool)
	for p := range cache {
		if _, ok := uniqueNames[strings.ToLower(p)]; ok {
			fmt.Println("DUPLICATE!!!!!!", p)
		}
		uniqueNames[strings.ToLower(p)] = true
	}

	allPlayers := make(map[string][]string)
	tournaments := GetTournaments()
	for _, tournament := range tournaments {
		for _, team := range tournament.Teams {
			for _, name := range team.Players {
				if _, ok := allPlayers[name]; !ok {
					allPlayers[name] = make([]string, 0)
				}
				allPlayers[name] = append(allPlayers[name], fmt.Sprintf("%s-%s", tournament.Name, team.Name))
			}
		}
	}

	uniqueNames2 := make(map[string]bool)
	for p, t := range allPlayers {
		if _, ok := uniqueNames2[strings.ToLower(p)]; ok {
			fmt.Println("TOURN DUPLICATE!!!!!", p, t)
			fmt.Println("matched with!!!!!", allPlayers[strings.ToLower(p)])
		}
		uniqueNames2[strings.ToLower(p)] = true
	}
}

// SmarterPlayers builds up events for players that matter based on the tournaments provided.
// TODO what about situations like Genocop for RLCS S1 NA Q1 where he's not listed on Liquipedia?
// ATM it's a sux2suck kinda situation
func SmarterPlayers() {
	tournaments := GetTournaments()

	minifiedPlayers := make(map[string]Player)

	for idx, tournament := range tournaments[0:8] {
		for _, team := range tournament.Teams {
			for _, name := range team.Players {
				// Get data for a chosen player
				fmt.Println(team.Name, "player", name)

				// use lowercase as the canonical version
				playerID := strings.ToLower(name)

				if _, ok := minifiedPlayers[playerID]; ok {
					fmt.Println("Already processed", name)
					continue
				}

				player := getPlayerDetails(name)

				// Find team participations that are relevant to all tournaments based on start/end date
				var memberships []Membership

				for _, membership := range player.Memberships {
					if membershipInTournaments(name, membership, tournaments[idx:]) {
						memberships = append(memberships, membership)
					}
				}
				fmt.Println(memberships)

				if len(memberships) > 0 {
					minifiedPlayers[playerID] = Player{Name: player.Name, Memberships: memberships}
				}
			}
		}
	}

	for p := range minifiedPlayers {
		fmt.Printf("%s ", p)
	}
	fmt.Println()

	// Convert map to a slice
	var playerArray []Player
	for _, v := range minifiedPlayers {
		playerArray = append(playerArray, v)
	}

	if WriteJSONFile(playerArray, eventsOutputFile) != nil {
		os.Exit(1)
	}
}
