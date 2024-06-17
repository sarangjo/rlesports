package rlesportsdb

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"strings"

	"github.com/sarangjo/rlesports/internal/rlesports"
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
			res := rlesports.FetchPlayer(player)
			output[player] = res
		}
	}
	if rlesports.WriteJSONFile(output, playersCacheFile) != nil {
		os.Exit(1)
	}

	return output
}

// ProcessPlayersData processes the wikitext from GetPlayersData and produces a list of Players
func ProcessPlayersData(output map[string]interface{}) {
	players := make([]rlesports.Player, 0, len(output))

	for _, playerData := range output {
		wikitext := playerData.(map[string]interface{})["wikitext"].(map[string]interface{})["*"].(string)
		player := rlesports.ParsePlayer(wikitext)
		players = append(players, player)
	}
}

// Need to fetch and persist
func updateData(n string, output map[string]interface{}) interface{} {
	x := rlesports.FetchPlayer(n)
	output[n] = x
	if rlesports.WriteJSONFile(output, playersCacheFile) != nil {
		os.Exit(1)
	}
	return x
}

func getPlayerDetails(name string) rlesports.Player {
	output := getCache()

	var playerData interface{}
	var ok bool
	if playerData, ok = output[name]; !ok {
		// Note that we persist even the REDIRECT directive so we don't waste an API call
		playerData = updateData(name, output)
	}

	// Check for redirect - we also want to persist that if possible
	var isRedirect bool
	var newName string
	if isRedirect, newName = rlesports.RedirectTo(playerData); isRedirect {
		fmt.Println("OMG OMG WE GOT A REDIRECT OMG!!!! FROM", name, "TO", newName)

		if playerData, ok = output[newName]; !ok {
			// Sad, we have to fetch anyway
			playerData = updateData(newName, output)
		}
	}

	playerDetails := rlesports.ParsePlayer(rlesports.ExtractWikitext(playerData))
	if isRedirect {
		// Which one is the alternate?
		var alternateID string
		if playerDetails.Name == name {
			alternateID = newName
		} else {
			alternateID = name
		}

		// Add redirect to alternate ID's if it isn't already there
		needToAdd := true
		for _, id := range playerDetails.AlternateIDs {
			if id == alternateID {
				needToAdd = false
				break
			}
		}
		if needToAdd {
			playerDetails.AlternateIDs = append(playerDetails.AlternateIDs, alternateID)
		}
	}

	return playerDetails
}

// TODO expand this to include "Team x", "x esports", etc.
func teamNameMatch(team1 string, team2 string) bool {
	return team1 == team2 || strings.ToLower(team1) == strings.ToLower(team2)
}

// Returns true if the given player happens to be playing for this team
func playerInTeam(player rlesports.Player, team rlesports.Team) bool {
	for _, p := range team.Players {
		if strings.ToLower(p) == strings.ToLower(player.Name) {
			return true
		}
		for _, alt := range player.AlternateIDs {
			if strings.ToLower(p) == strings.ToLower(alt) {
				return true
			}
		}
	}
	return false
}

// DESIGN CHOICES
// OPTION 1: Count up till
// OPTION 2: Just go by times.
//
// OPTION 2 KNOWN BUG: If a player who played in a particular tournament joins a team BEFORE THE EVENT's END
// DATE, that shows up. The best fix for this would be expanding information from the tournament
// side about all the names of the teams that might be in there.

// TODO optimize more?
// The goal here basically is to filter out the memberships that are actually in
// a tournament.
// This is shared logic with Table.tsx::process()
func filterByTournament(player rlesports.Player, seasons []rlesports.RlcsSeason, seasonIdx int) []rlesports.Membership {
	filterBitSet := make([]bool, len(player.Memberships))

	// We can improve our time by only looking at memberships past a certain one once we've ensured
	// that all memberships below that number have already been set to TRUE in the bitset
	// TODO implement
	// lowestMembership := 0

	// Go through each tournament and turn on the memberships that matter
	for _, season := range seasons[seasonIdx:] {
		for _, section := range season.Sections {
			for _, t := range section.Tournaments {
				// Okay. For this tournament, which memberships fit?
				tourneyBitSet := make([]bool, len(player.Memberships))
				// It is possible that we never found a match. In that case be more permissive. Note
				// this is up to but NOT including
				lastTeamMatch := len(player.Memberships)

				// Note. We could have multiple memberships that overlap with this tournament.
				for idx, membership := range player.Memberships {
					// if membership.Leave != "" && membership.Leave < t.Start {
					// 	// quit out early
					// 	lowestMembership++
					// 	if lowestMembership == len(player.Memberships) {
					// 		break SeasonLoop
					// 	}
					// TODO change >= to > (e.g. Lemonpuppy * Radiance acquired right at the start
					// of RLCS)
					if membership.Join <= t.End && (membership.Leave == "" || membership.Leave >= t.Start) {
						// First check passed: this lines up by time
						for _, team := range t.Teams {
							// Second check: we confirm that this player actually participated,
							// using player names and alternate ID's
							tourneyBitSet[idx] = tourneyBitSet[idx] || playerInTeam(player, team)
							// } else {
							// 	// Second check: we confirm that this player actually participated,
							// 	// using player names and alternate ID's
							// 	filterBitSet[idx] = filterBitSet[idx] || playerInTeam(player, team)
							// }

							// Third check: If the team name matches this membership, no further memberships
							// can possibly match this tournament. Let's get out and move on to
							// the next tournament and do this fun thing all over again!
							if teamNameMatch(team.Name, membership.Team) {
								lastTeamMatch = idx + 1
							}
						}
					}
				}

				// Okay we went through all memberships and evaluated which memberships line up. We
				// also know the index of the *last* membership which matches the team name for this
				// tournament. This means we can apply the bitmask only up till (and including) this
				// last index
				for idx, tourneyBit := range tourneyBitSet[:lastTeamMatch] {
					filterBitSet[idx] = filterBitSet[idx] || tourneyBit
				}
			}
		}
	}

	// Extract the memberships we selected via the bitset
	var filtered []rlesports.Membership
	for idx, m := range player.Memberships {
		if filterBitSet[idx] {
			filtered = append(filtered, m)
		}
	}

	return filtered
}

// SmarterPlayers builds up events for players that matter based on the tournaments provided.
func SmarterPlayers() {
	// tournaments := GetTournaments()
	minifiedPlayers := make(map[string]rlesports.Player)

	seasons := GetSeasons()

	for seasonIdx, season := range seasons {
		fmt.Println("SEASON", season.Season)
		for _, section := range season.Sections {
			fmt.Println("\tSECTION", section.Name)
			for _, tournament := range section.Tournaments {
				fmt.Println("\t\tREGION", tournament.Region.String())
				for _, team := range tournament.Teams {
					fmt.Println("\t\t\tTEAM", team.Name)
					for _, tname := range team.Players {
						fmt.Print("\t\t\t\tPLAYER ", tname)

						// use lowercase when checking for duplicates
						// TODO this really is shitty
						playerID := strings.ToLower(tname)

						if _, ok := minifiedPlayers[playerID]; ok {
							fmt.Println(" [Already processed]")
							continue
						}

						player := getPlayerDetails(tname)

						///// Past this point, we don't use name; we use player.Name /////

						// Second check in case of redirect
						playerID = strings.ToLower(player.Name)
						if _, ok := minifiedPlayers[playerID]; ok {
							fmt.Println(" [Already processed]")
							continue
						}

						// Find team participations that are relevant to all tournaments based on start/end date
						memberships := filterByTournament(player, seasons, seasonIdx)

						if len(memberships) > 0 {
							minifiedPlayers[playerID] = rlesports.Player{Name: player.Name, AlternateIDs: player.AlternateIDs, Memberships: memberships}
						}
						fmt.Println(" Done processing.")
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
	var playerArray []rlesports.Player
	for _, v := range minifiedPlayers {
		playerArray = append(playerArray, v)
	}

	if rlesports.WriteJSONFile(playerArray, eventsOutputFile) != nil {
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
