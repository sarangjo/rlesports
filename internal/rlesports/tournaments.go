package rlesports

import "fmt"

const InfoboxSectionIndex = 0

func GetTournament(name string) Tournament {
	wikitext := FetchSection(name, 0 /* section 0 */)
	start, end, region := ParseStartEndRegion(wikitext)

	fmt.Println(start, end, region)

	return Tournament{}
}
