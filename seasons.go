package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"strconv"
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

	WriteJSONFile(seasons, "src/data/seasons.json")
}

const seasonsFile = "src/data/seasons.json"

// When using the JSON
func readSeasons() []RlcsSeason {
	file, err := os.Open(seasonsFile)
	if err != nil {
		fmt.Println("Unable to open db file", err)
		return []RlcsSeason{}
	}
	byteValue, err := ioutil.ReadAll(file)
	if err != nil {
		fmt.Println("Unable to read file", err)
		os.Exit(1)
	}
	var output []RlcsSeason
	json.Unmarshal(byteValue, &output)
	file.Close()
	return output
}

// UpdateSeasons x
func UpdateSeasons() {
	for _, season := range seasons {
		// 1. Check to see if this tournament has been cached
		for _, section := range season.Sections {
			for _, tourney := range section.Tournaments {
				// 2. Fetch needed data from API

				// 2.a Infobox processing
				// Fetch infobox first because team information depends on region
				wikitext := FetchSection(tourney.Path, infoboxSectionIndex)
				tourney.Start, tourney.End, tourney.Region = ParseStartEndRegion(wikitext)

				// 2.b Teams processing
				sectionIndex := findSectionIndex(FetchSections(tourney.Path), playersSectionTitle)
				if sectionIndex < 0 {
					fmt.Println("Unable to find participants section for", tourney.Path)
				} else {
					wikitext := FetchSection(tourney.Path, sectionIndex)
					tourney.Teams = ParseTeams(wikitext, tourney.Region)
				}
			}
		}
		// 3. Upload the tournament
	}
}
