package main

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

// RLCS only.
const prefix = "Rocket League Championship Series/Season "
const seasonMax = 1

func buildSeasons() []RlcsSeason {
	var seasons []RlcsSeason

	regions := []Region{RegionNorthAmerica, RegionEurope}
	for season := 1; season <= seasonMax; season++ {
		rlcsSeason := RlcsSeason{Season: strconv.Itoa(season)}

		if season == 1 {
			// Two qualifiers for S1
			for qualifier := 1; qualifier <= 2; qualifier++ {
				section := Section{Name: fmt.Sprintf("Qualifier %d", qualifier)}

				for _, region := range regions {
					section.Tournaments = append(section.Tournaments, Tournament{
						Region: region,
						Path:   fmt.Sprintf("%s%d/%s/Qualifier %d", prefix, season, region.String(), qualifier),
					})
				}
				rlcsSeason.Sections = append(rlcsSeason.Sections, section)
			}
		} else {
			section := Section{Name: "Regional"}
			for _, region := range regions {
				section.Tournaments = append(section.Tournaments, Tournament{Region: region, Path: fmt.Sprintf("%s%d/%s", prefix, season, region.String())})
			}
			rlcsSeason.Sections = append(rlcsSeason.Sections, section)
		}
		// COVID :(
		if season != 9 {
			rlcsSeason.Sections = append(rlcsSeason.Sections,
				Section{
					Name:        "Finals",
					Tournaments: []Tournament{{Region: RegionWorld, Path: fmt.Sprintf("%s%d", prefix, season)}},
				},
			)
		}

		seasons = append(seasons, rlcsSeason)
	}

	return seasons
}

var seasons = buildSeasons()

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

func singleConvert() {
	for sn, season := range seasons {
		for secn, section := range season.Sections {
			for tn, tourney := range section.Tournaments {
				oldT := OldTournament{Name: tourney.Path}
				GetTournament(&oldT)
				seasons[sn].Sections[secn].Tournaments[tn].Start = oldT.Start
				seasons[sn].Sections[secn].Tournaments[tn].End = oldT.End
				seasons[sn].Sections[secn].Tournaments[tn].Teams = oldT.Teams
			}
		}
	}

	WriteJSONFile(seasons, "src/data/tournaments.json")
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
