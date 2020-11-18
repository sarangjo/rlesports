package main

import (
	"fmt"
	"strconv"
)

// RLCS only.
const prefix = "Rocket League Championship Series/Season "
const seasonMax = 4

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

			// Season 3 onwards: OCE
			if season >= 3 {
				if season == 3 {
					section.Tournaments = append(section.Tournaments, Tournament{
						Region: RegionOceania,
						Name:   "ThrowdownTV/Rocket League Challenge/Season 2/League Play",
					})
				} else if season == 4 {
					section.Tournaments = append(section.Tournaments, Tournament{
						Region: RegionOceania,
						Name:   fmt.Sprintf("%s%d/%s/League Play", prefix, season, RegionOceania.String()),
					})
				}
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
