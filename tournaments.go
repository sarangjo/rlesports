package main

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

const prefix = "Rocket League Championship Series/Season "
const region = "North America"

var tournamentNames = []string{
	fmt.Sprintf("%s1/%s/Qualifier 1", prefix, region),
	fmt.Sprintf("%s1/Europe/Qualifier 1", prefix),
	fmt.Sprintf("%s1/%s/Qualifier 2", prefix, region),
	fmt.Sprintf("%s1", prefix),
	fmt.Sprintf("%s2/%s", prefix, region),
	fmt.Sprintf("%s2", prefix),
	fmt.Sprintf("%s3/%s", prefix, region),
	fmt.Sprintf("%s3", prefix),
	fmt.Sprintf("%s4/%s", prefix, region),
	fmt.Sprintf("%s4", prefix),
	fmt.Sprintf("%s5/%s", prefix, region),
	fmt.Sprintf("%s5", prefix),
	fmt.Sprintf("%s6/%s", prefix, region),
	fmt.Sprintf("%s6", prefix),
	fmt.Sprintf("%s7/%s", prefix, region),
	fmt.Sprintf("%s7", prefix),
	fmt.Sprintf("%s8/%s", prefix, region),
	fmt.Sprintf("%s8", prefix),
	fmt.Sprintf("%s9/%s", prefix, region),
}

const playersSectionTitle = "participants"
const minTeamSize = 1 // TODO should be 2?
const infoboxSectionIndex = 0

// UpdateTournaments goes through saved tournaments and updates fields that are missing.
func UpdateTournaments(forceUpload bool) {
	for _, name := range tournamentNames {
		needTeams := false
		needDetails := false

		// 1. Check to see if this tournament has been cached
		tourney := Tournament{Name: name}
		err := GetTournament(&tourney)
		needTeams = forceUpload || err != nil || len(tourney.Teams) == 0
		needDetails = forceUpload || err != nil || tourney.Start == "" || tourney.End == "" || tourney.Region == RegionNone

		var teamsString, detailsString string
		if needTeams {
			teamsString = "teams"
		} else {
			teamsString = "no teams"
		}
		if needDetails {
			detailsString = "details"
		} else {
			detailsString = "no details"
		}
		fmt.Println(name, teamsString, detailsString)

		// 2. Fetch needed data from API
		if needTeams {
			// Need to find the right section for participants
			allSections := FetchSections(name)

			sectionIndex := findSectionIndex(allSections, playersSectionTitle)
			if sectionIndex < 0 {
				fmt.Println("Unable to find participants section for", name)
			} else {
				wikitext := FetchSection(name, sectionIndex)
				tourney.Teams = ParseTeams(wikitext)
			}
		}

		if needDetails {
			wikitext := FetchSection(name, infoboxSectionIndex)
			tourney.Start, tourney.End, tourney.Region = ParseStartEndRegion(wikitext)
		}

		// 3. Upload the tournament
		if needTeams || needDetails {
			UploadTournament(tourney)
		}
	}
}

// findSectionIndex finds the section that has `participants` as the line/anchor
func findSectionIndex(sections []map[string]interface{}, sectionTitle string) int {
	for _, section := range sections {
		if strings.Contains(strings.ToLower(section["line"].(string)), sectionTitle) ||
			strings.Contains(strings.ToLower(section["anchor"].(string)), sectionTitle) {
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
