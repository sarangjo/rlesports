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
