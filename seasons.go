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
const seasonMax = 2

func buildSeasonSkeletons() []RlcsSeason {
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
						Name:   fmt.Sprintf("%s%d/%s/Qualifier %d", prefix, season, region.String(), qualifier),
					})
				}
				rlcsSeason.Sections = append(rlcsSeason.Sections, section)
			}
		} else {
			section := Section{Name: "Regional"}
			for _, region := range regions {
				section.Tournaments = append(section.Tournaments, Tournament{Region: region, Name: fmt.Sprintf("%s%d/%s", prefix, season, region.String())})
			}
			rlcsSeason.Sections = append(rlcsSeason.Sections, section)
		}
		// COVID :(
		if season != 9 {
			rlcsSeason.Sections = append(rlcsSeason.Sections,
				Section{
					Name:        "Finals",
					Tournaments: []Tournament{{Region: RegionWorld, Name: fmt.Sprintf("%s%d", prefix, season)}},
				},
			)
		}

		seasons = append(seasons, rlcsSeason)
	}

	return seasons
}

var seasonSkeletons = buildSeasonSkeletons()

func singleConvert() {
	for sn, season := range seasonSkeletons {
		for secn, section := range season.Sections {
			for tn, tourney := range section.Tournaments {
				oldT := TournamentDoc{Name: tourney.Name}
				GetTournament(&oldT)
				seasonSkeletons[sn].Sections[secn].Tournaments[tn].Start = oldT.Start
				seasonSkeletons[sn].Sections[secn].Tournaments[tn].End = oldT.End
				seasonSkeletons[sn].Sections[secn].Tournaments[tn].Teams = oldT.Teams
			}
		}
	}

	WriteJSONFile(seasonSkeletons, "src/data/seasons.json")
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

// GetSeasons returns fleshed-out seasons
func GetSeasons() []RlcsSeason {
	// Start with rlcs skeletons, get all tournaments piecemeal. Start inefficient, get more efficient over time.
	var seasons []RlcsSeason
	for _, sSkeleton := range seasonSkeletons {
		season := RlcsSeason{Season: sSkeleton.Season}
		for _, secSkeleton := range sSkeleton.Sections {
			section := Section{Name: secSkeleton.Name}
			for _, tSkeleton := range secSkeleton.Tournaments {
				tourney := Tournament{
					Region: tSkeleton.Region,
					Name:   tSkeleton.Name,
				}

				// fetch doc and overwrite fields
				doc := TournamentDoc{Name: tSkeleton.Name}
				if err := GetTournament(&doc); err != nil {
					panic("lulw")
				}

				tourney.Start = doc.Start
				tourney.End = doc.End
				tourney.Teams = doc.Teams

				section.Tournaments = append(section.Tournaments, tourney)
			}
			season.Sections = append(season.Sections, section)
		}
		seasons = append(seasons, season)
	}
	return seasons
}
