package rlesports

import (
	"fmt"
	"strconv"
)

// RLCS only.
const prefix = "Rocket League Championship Series/Season "

// Builds a skeleton of all RLCS seasons with tournament names only. These tournament names are then
// used to query the corresponding page on Liquipedia to fetch all of the further content (teams,
// players, logos, etc.). At the moment this is manual, but this could potentially be fetched from
// a particular Liquipedia page (such as "Rocket_League_Championship_Series").
func buildSeasonSkeletons() []RlcsSeason {
	var seasons []RlcsSeason
	const seasonMax = 9

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
				} else if season >= 4 {
					section.Tournaments = append(section.Tournaments, Tournament{
						Region: RegionOceania,
						Name:   fmt.Sprintf("%s%d/%s/League Play", prefix, season, RegionOceania.String()),
					})
				}
			}

			// TODO: SAM and MENA

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

var SeasonSkeletons = buildSeasonSkeletons()

func TournamentSkeletons(maxSeason int) (tournaments []Tournament) {
	getRegions := func(season int) []Region {
		if season < 3 {
			return []Region{RegionNorthAmerica, RegionEurope}
		} else {
			return []Region{RegionNorthAmerica, RegionEurope, RegionOceania}
		}
	}

	for season := 1; season <= maxSeason; season++ {
		if season == 1 {
			// Regionals: Two qualifiers for S1
			for qualifier := 1; qualifier <= 2; qualifier++ {
				for _, region := range getRegions(season) {
					tournaments = append(tournaments, Tournament{
						Name:   fmt.Sprintf("%s%d/%s/Qualifier %d", prefix, season, region.String(), qualifier),
						Region: region,
						Season: strconv.Itoa(season),
					})
				}
			}
		} else {
			// Regionals
			for _, region := range getRegions(season) {
				tournaments = append(tournaments, Tournament{
					Name:   fmt.Sprintf("%s%d/%s", prefix, season, region.String()),
					Region: region,
					Season: strconv.Itoa(season),
				})
			}
		}

		// Finals
		tournaments = append(tournaments, Tournament{
			Name:   fmt.Sprintf("%s%d", prefix, season),
			Region: RegionWorld,
			Season: strconv.Itoa(season),
		})
	}

	return tournaments
}
