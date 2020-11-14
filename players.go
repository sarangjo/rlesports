package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"strings"
)

const playersCacheFile = "cache/pcache.json"
const eventsOutputFile = "src/data/players.json"

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
			res := FetchPlayer(player)
			output[player] = res
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

// Need to fetch and persist
func updateData(n string, output map[string]interface{}) interface{} {
	x := FetchPlayer(n)
	output[n] = x
	if WriteJSONFile(output, playersCacheFile) != nil {
		os.Exit(1)
	}
	return x
}

func getPlayerDetails(name string) Player {
	output := getCache()

	var playerData interface{}
	var ok bool
	if playerData, ok = output[name]; !ok {
		// Note that we persist even the REDIRECT directive so we don't waste an API call
		playerData = updateData(name, output)
	}

	// Check for redirect - we also want to persist that if possible
	if isRed, newName := redirectTo(playerData); isRed {
		fmt.Println("OMG OMG WE GOT A REDIRECT OMG!!!! FROM", name, "TO", newName)

		if playerData, ok = output[newName]; !ok {
			// Sad, we have to fetch anyway
			playerData = updateData(newName, output)
		}
	}

	return ParsePlayer(extractWikitext(playerData))
}

func membershipInTournaments(player Player, membership Membership, seasons []RlcsSeason,
	seasonIdx int, sectionIdx int, tournIdx int) bool {
	for _, season := range seasons[seasonIdx:] {
		for _, section := range season.Sections[sectionIdx:] {
			for _, t := range section.Tournaments[tournIdx:] {
				if membership.Join < t.End && (membership.Leave == "" || membership.Leave > t.Start) {
					// Don't care about team name cuz they could be acquired; purely player-based. This could
					// be flawed if Liquipedia doesn't show members that may not be there at the end of the
					// tournament (i.e. due to leaving/joining mid-tournament)
					for _, team := range t.Teams {
						for _, p := range team.Players {
							if p == player.Name {
								return true
							}
							for _, alt := range player.AlternateIDs {
								if p == alt {
									return true
								}
							}
						}
					}
				}
			}
		}
	}

	return false
}

// SmarterPlayers builds up events for players that matter based on the tournaments provided.
func SmarterPlayers() {
	// tournaments := GetTournaments()
	minifiedPlayers := make(map[string]Player)

	seasons := readSeasons()

	for seasonIdx, season := range seasons {
		for sectionIdx, section := range season.Sections {
			for tournIdx, tournament := range section.Tournaments {
				for _, team := range tournament.Teams {
					for _, tname := range team.Players {
						// Get data for a chosen player
						fmt.Println(team.Name, "player", tname)

						// use lowercase when checking for duplicates
						// TODO this really is shitty
						playerID := strings.ToLower(tname)

						if _, ok := minifiedPlayers[playerID]; ok {
							fmt.Println("Already processed", tname)
							continue
						}

						player := getPlayerDetails(tname)

						///// Past this point, we don't use name; we use player.Name /////

						playerID = strings.ToLower(player.Name)
						if _, ok := minifiedPlayers[playerID]; ok {
							fmt.Println("Already processed", player.Name)
							continue
						}

						// Find team participations that are relevant to all tournaments based on start/end date
						var memberships []Membership

						for _, membership := range player.Memberships {
							if membershipInTournaments(player, membership, seasons, seasonIdx, sectionIdx, tournIdx) {
								memberships = append(memberships, membership)
							}
						}
						fmt.Println(memberships)

						if len(memberships) > 0 {
							minifiedPlayers[playerID] = Player{Name: player.Name, AlternateIDs: player.AlternateIDs, Memberships: memberships}
						}
					}
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

// CacheProcess verifies cache integrity
func CacheProcess() {
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
