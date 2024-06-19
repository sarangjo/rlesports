package rlesports

import (
	"fmt"
)

const (
	InfoboxSectionIndex = 0
	PlayersSectionTitle = "participants"
)

// GetTournament fetches a single tournament. If participationSection isn't known, set it to -1.
// Example name: Rocket_League_Championship_Series/Season_1/North_America/Qualifier_1
func GetTournament(t *Tournament, participationSection int) {
	if t.Start == "" || t.End == "" || t.Region == RegionNone {
		// Start, end, region
		wikitext := FetchSection(t.Name, InfoboxSectionIndex)
		t.Start, t.End, t.Region = ParseStartEndRegion(wikitext)
	}

	if len(t.Teams) == 0 {
		// Teams (i.e. "Participants")
		if participationSection < 0 {
			allSections := FetchSections(t.Name)
			participationSection = FindSectionIndex(allSections, PlayersSectionTitle)
		}
		wikitext := FetchSection(t.Name, participationSection)
		t.Teams = ParseTeams(wikitext, t.Region)
	}
}

// Returns true if incomplete
func areTeamsIncomplete(tournament Tournament) bool {
	if len(tournament.Teams) == 0 {
		fmt.Println(tournament.Name, "No teams found")
		return true
	}

	for _, t := range tournament.Teams {
		if t.Region == RegionNone {
			fmt.Println(tournament.Name, t.Name, "No region found")
			return true
		}
	}
	return false
}

// dbg prints out the status of a tournament during the update process
func dbg(name string, needTeams bool, needDetails bool) {
	var teamsString, detailsString string
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
	fmt.Println(name, teamsString, detailsString)
}

// UpdateTournaments goes through saved tournaments and updates fields that are missing.
func UpdateTournaments(storage Storage, forceUpload bool) {
	for _, tournament := range TournamentSkeletons(1) {
		updatedTourney := tournament
		tourneyMetadata := TournamentLPMetadata{ParticipationSection: -1}

		err := storage.GetTournament(&updatedTourney, &tourneyMetadata)

		// 1. Check to see if this tournament has been cached, and if so, cached correctly. There
		// are various checks here
		// 1.a Infobox details
		needInfobox := forceUpload || err != nil || updatedTourney.Start == "" || updatedTourney.End == "" || updatedTourney.Region == RegionNone
		// 1.b Team details
		needTeams := forceUpload || err != nil || areTeamsIncomplete(updatedTourney)

		dbg(tournament.Name, needTeams, needInfobox)

		// 2. Fetch needed data from API
		// 2.a Infobox: fetch first because team information depends on region
		if needInfobox {
			wikitext := FetchSection(tournament.Name, InfoboxSectionIndex)
			updatedTourney.Start, updatedTourney.End, updatedTourney.Region = ParseStartEndRegion(wikitext)
		}
		// 2.b Teams
		if needTeams {
			if tourneyMetadata.ParticipationSection <= 0 {
				// Need to find the right section for participants
				allSections := FetchSections(tournament.Name)
				tourneyMetadata.ParticipationSection = FindSectionIndex(allSections, PlayersSectionTitle)
			}

			if tourneyMetadata.ParticipationSection < 0 {
				fmt.Println("Unable to find participants section for", tournament.Name)
			} else {
				wikitext := FetchSection(tournament.Name, tourneyMetadata.ParticipationSection)
				updatedTourney.Teams = ParseTeams(wikitext, updatedTourney.Region)
			}
		}

		// TODO: get images for teams

		// 3. Upload the tournament
		if needTeams || needInfobox {
			storage.UploadTournament(updatedTourney, tourneyMetadata)
		}
	}
}
