package main

import (
	"fmt"
)

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

		fmt.Println(name, needTeams, needDetails)

		// 2. Fetch needed data from API
		if needTeams {
			// Need to find the right section for participants
			allSections := GetSections(name)

			sectionIndex := FindSectionIndex(allSections, playersSectionTitle)
			if sectionIndex < 0 {
				fmt.Println("Unable to find participants section for", name)
			} else {
				wikitext := GetSection(name, sectionIndex)
				tourney.Teams = ParseTeams(wikitext)
			}
		}

		if needDetails {
			wikitext := GetSection(name, infoboxSectionIndex)
			tourney.Start, tourney.End, tourney.Region = ParseStartEndRegion(wikitext)
		}

		// 3. Upload the tournament
		if needTeams || needDetails {
			UploadTournament(tourney)
		}
	}
}
