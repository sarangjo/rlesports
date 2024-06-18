package rlesports

const (
	InfoboxSectionIndex = 0
	PlayersSectionTitle = "participants"
)

// GetTournament fetches a single tournament. If participationSection isn't known, set it to -1.
// Example name: Rocket_League_Championship_Series/Season_1/North_America/Qualifier_1
func GetTournament(name string, participationSection int) Tournament {
	t := Tournament{
		Name: name,
	}

	// Start, end, region
	wikitext := FetchSection(name, InfoboxSectionIndex)
	t.Start, t.End, t.Region = ParseStartEndRegion(wikitext)

	// Participants
	if participationSection < 0 {
		allSections := FetchSections(name)
		participationSection = FindSectionIndex(allSections, PlayersSectionTitle)
	}
	wikitext = FetchSection(name, participationSection)
	t.Teams = ParseTeams(wikitext, t.Region)

	return t
}
