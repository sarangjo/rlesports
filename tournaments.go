package main

import (
	"fmt"
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

// Returns true if incomplete
func areTeamsIncomplete(d TournamentDoc) bool {
	if len(d.Teams) == 0 {
		return true
	}

	for _, t := range d.Teams {
		if t.Region == RegionNone {
			return true
		}
	}
	return false
}

// UpdateTournaments goes through saved tournaments and updates fields that are missing.
func UpdateTournaments(forceUpload bool) {
	for _, sSkeleton := range seasonSkeletons {
		for index, secSkeleton := range sSkeleton.Sections {
			for _, tSkeleton := range secSkeleton.Tournaments {
				updatedTourney := TournamentDoc{Name: tSkeleton.Name}
				err := GetTournament(&updatedTourney)

				// 1. Check to see if this tournament has been cached, and if so, cached correctly. There
				// are various checks here
				// 1.a Infobox details
				needInfobox := forceUpload || err != nil || updatedTourney.Start == "" || updatedTourney.End == "" || updatedTourney.Region == RegionNone ||
					updatedTourney.Region != tSkeleton.Region
				// 1.b Team details
				needTeams := forceUpload || err != nil || areTeamsIncomplete(updatedTourney)
				// 1.c Other mismatches
				needMetadata := forceUpload || err != nil || updatedTourney.Season == "" || updatedTourney.Season != sSkeleton.Season ||
					updatedTourney.Index != index

				dbg(tSkeleton.Name, needTeams, needInfobox, needMetadata)

				// 2. Fetch needed data from API
				// 2.a Infobox: fetch first because team information depends on region
				if needInfobox {
					wikitext := FetchSection(tSkeleton.Name, infoboxSectionIndex)
					updatedTourney.Start, updatedTourney.End, updatedTourney.Region = ParseStartEndRegion(wikitext)
				}
				// 2.b Teams
				if needTeams {
					if updatedTourney.ParticipationSection <= 0 {
						// Need to find the right section for participants
						allSections := FetchSections(tSkeleton.Name)
						updatedTourney.ParticipationSection = findSectionIndex(allSections, playersSectionTitle)
					}

					if updatedTourney.ParticipationSection < 0 {
						fmt.Println("Unable to find participants section for", tSkeleton.Name)
					} else {
						wikitext := FetchSection(tSkeleton.Name, updatedTourney.ParticipationSection)
						updatedTourney.Teams = ParseTeams(wikitext, updatedTourney.Region)
					}
				}
				// 2.c Other
				if needMetadata {
					updatedTourney.Season = sSkeleton.Season
					updatedTourney.Region = tSkeleton.Region
					updatedTourney.Index = index
				}

				// 3. Upload the tournament
				if needTeams || needInfobox || needMetadata {
					UploadTournament(updatedTourney)
				}
			}
		}
	}
}
