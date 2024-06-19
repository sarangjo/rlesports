package rlesports

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
