package main

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

const playersSectionTitle = "participants"
const minTeamSize = 1 // TODO should be 2?
const infoboxSectionIndex = 0

func dbg(name string, needTeams bool, needDetails bool, needMetadata bool) {
	var teamsString, detailsString, metadataString string
	if needTeams {
		teamsString = "teams"
	} else {
		teamsString = "noteams"
	}
	if needDetails {
		detailsString = "details"
	} else {
		detailsString = "nodetails"
	}
	if needMetadata {
		metadataString = "metadata"
	} else {
		metadataString = "nometadata"
	}
	fmt.Println(name, teamsString, detailsString, metadataString)
}

// UpdateTournaments goes through saved tournaments and updates fields that are missing.
func UpdateTournaments(forceUpload bool) {
	for _, tourney := range []OldTournament{} {
		// 1. Check to see if this tournament has been cached
		updatedTourney := OldTournament{Name: tourney.Name}
		err := GetTournament(&updatedTourney)
		needTeams := forceUpload || err != nil || len(updatedTourney.Teams) == 0
		needDetails := forceUpload || err != nil || updatedTourney.Start == "" || updatedTourney.End == "" || updatedTourney.Region == RegionNone
		needMetadata := forceUpload || err != nil || updatedTourney.Season == ""

		dbg(tourney.Name, needTeams, needDetails, needMetadata)

		// 2. Fetch needed data from API
		if needTeams {
			// Need to find the right section for participants
			allSections := FetchSections(tourney.Name)

			sectionIndex := findSectionIndex(allSections, playersSectionTitle)
			if sectionIndex < 0 {
				fmt.Println("Unable to find participants section for", tourney.Name)
			} else {
				wikitext := FetchSection(tourney.Name, sectionIndex)
				updatedTourney.Teams = ParseTeams(wikitext)
			}
		}
		if needDetails {
			wikitext := FetchSection(tourney.Name, infoboxSectionIndex)
			updatedTourney.Start, updatedTourney.End, updatedTourney.Region = ParseStartEndRegion(wikitext)
		}
		if needMetadata {
			updatedTourney.Season = tourney.Season
			updatedTourney.Region = tourney.Region
			updatedTourney.Index = tourney.Index
		}

		// 3. Upload the tournament
		if needTeams || needDetails || needMetadata {
			UploadTournament(updatedTourney)
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
