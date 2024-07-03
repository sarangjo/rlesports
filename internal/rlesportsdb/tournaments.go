package rlesportsdb

import (
	"fmt"
	"os"

	"github.com/sarangjo/rlesports/internal/rlesports"
)

// TODO delete

// GetSeasons returns fleshed-out seasons
func GetSeasons() []rlesports.RlcsSeason {
	// Start with rlcs skeletons, get all tournaments piecemeal. Start inefficient, get more efficient over time.
	var seasons []rlesports.RlcsSeason
	for _, sSkeleton := range rlesports.SeasonSkeletons {
		season := rlesports.RlcsSeason{Season: sSkeleton.Season}
		for _, secSkeleton := range sSkeleton.Sections {
			section := rlesports.Section{Name: secSkeleton.Name}
			for _, tSkeleton := range secSkeleton.Tournaments {
				tourney := rlesports.Tournament{
					Region: tSkeleton.Region,
					Name:   tSkeleton.Name,
				}

				// fetch doc and overwrite fields
				doc := TournamentDoc{Name: tSkeleton.Name}
				if err := GetTournament(&doc); err != nil {
					fmt.Fprintf(os.Stderr, "COULD NOT FIND DOCUMENT! WHAT ARE YOU DOING!")
					os.Exit(1)
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
