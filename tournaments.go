package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"regexp"
	"strconv"
	"strings"
)

// Team is a single team
type Team struct {
	Players []string `json:"players"`
	Subs    []string `json:"subs"`
	Name    string   `json:"name"`
}

// Tournament describes, well, a tournament
type Tournament struct {
	Name  string `json:"name"`
	Teams []Team `json:"teams"`
}

const tournamentsCacheFile = "cache/cache.json"

const prefix = "Rocket League Championship Series/Season "
const region = "North America"

var tournamentNames = []string{
	fmt.Sprintf("%s1/%s/Qualifier 1", prefix, region),
	fmt.Sprintf("%s1/%s/Qualifier 2", prefix, region),
	fmt.Sprintf("%s1", prefix),
	fmt.Sprintf("%s2/%s", prefix, region),
	fmt.Sprintf("%s2", prefix),
	fmt.Sprintf("%s3/%s", prefix, region),
	fmt.Sprintf("%s3", prefix),
	fmt.Sprintf("%s5/%s", prefix, region),
	fmt.Sprintf("%s5", prefix),
	fmt.Sprintf("%s6/%s", prefix, region),
	fmt.Sprintf("%s6", prefix),
	fmt.Sprintf("%s7/%s", prefix, region),
	fmt.Sprintf("%s7", prefix),
	// fmt.Sprintf("%s8/%s", prefix, region),
	// fmt.Sprintf("%s8", prefix),
}

const playersSectionTitle = "participants"
const minTeamSize = 1 // TODO should be 2?

// Find the section that has `participants` as the line/anchor
func findSectionIndex(sections []map[string]interface{}) int {
	for _, section := range sections {
		if strings.Contains(strings.ToLower(section["line"].(string)), playersSectionTitle) ||
			strings.Contains(strings.ToLower(section["anchor"].(string)), playersSectionTitle) {
			num, err := strconv.Atoi(section["index"].(string))
			if err != nil {
				fmt.Println("Unable to convert index to number", err)
				os.Exit(1)
			}
			return num
		}
	}
	return -1
}

// GetTournamentsData gets tournaments data and returns parsed wikitext
func GetTournamentsData() (output map[string]interface{}) {
	file, err := os.Open(tournamentsCacheFile)
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

	for _, t := range tournamentNames {
		if _, ok := output[t]; !ok {
			allSections := GetSections(t)
			sectionIndex := findSectionIndex(allSections)

			if sectionIndex < 0 {
				fmt.Printf("Unable to find participants section for %s. Ignoring.", t)
				continue
			}

			output[t] = GetSection(t, sectionIndex)
		}
	}

	outputBytes, err := json.MarshalIndent(output, "", "  ")
	if err != nil {
		fmt.Println("Unable to marshal output", err)
		os.Exit(1)
	}
	err = ioutil.WriteFile(tournamentsCacheFile, outputBytes, 0644)
	if err != nil {
		fmt.Println("Unable to write out tournaments cache file", err)
		os.Exit(1)
	}

	return output
}

// ProcessTournamentsData processes the wikitext from GetTournamentsData and produces a list of
// Tournaments
func ProcessTournamentsData(output map[string]interface{}) []Tournament {
	tournaments := make([]Tournament, 0, len(output))

	// Order matches tournament names
	for _, t := range tournamentNames {
		tourney := output[t]

		// We are processing all of the lines per tournament
		lines := strings.Split(tourney.(map[string]interface{})["wikitext"].(map[string]interface{})["*"].(string), "\n")
		// Each tournament has a set of teams
		teams := []Team{}
		// These are used as we parse one team at a time
		team := Team{}
		foundTeam := false

		// Line format is:
		// |team=iBUYPOWER
		// |p1=Kronovi |p1flag=us
		// |p2=Lachinio |p2flag=ca
		// |p3=Gambit |p3flag=us
		// |p4=0ver Zer0|p4flag=us
		// |qualifier=[[Rocket_League_Championship_Series/Season_1/North_America/Qualifier_1|Qualifier #1]]
		for _, line := range lines {
			// This divides teams, so we save the team we've been collecting so far
			if strings.HasPrefix(line, "|team") {
				// Handle special case for the first team
				if foundTeam && len(team.Players) >= minTeamSize {
					teams = append(teams, team)
					team = Team{}
				}
				team.Name = strings.Replace(line, "|team=", "", 1)
				foundTeam = true
				// Once we've found a team, parse at least 3 players
			} else if foundTeam {
				// Player line has to start as so:
				// TODO: start with `^`? replace [|] with `|?`?
				if res, _ := regexp.Match("[|]p[0-9]=", []byte(line)); res {
					player := strings.TrimSpace(strings.Split(strings.Split(line, "|")[1], "=")[1])
					if len(player) > 0 {
						team.Players = append(team.Players, player)
					}
				}
			}
		}

		// Fencepost for the last team
		if len(team.Players) >= minTeamSize {
			teams = append(teams, team)
		}

		tournaments = append(tournaments, Tournament{Name: t, Teams: teams})
	}

	return tournaments
}

// UploadTournamentsData uploads the data to the db
func UploadTournamentsData(data []Tournament) {
	UploadTournaments(data)
}
