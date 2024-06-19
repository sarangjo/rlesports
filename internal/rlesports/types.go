package rlesports

// Try to keep this in sync with `types.ts` in the frontend please.

// Team is a single team
type Team struct {
	Name    string   `json:"name"`
	Players []string `json:"players"`
	Subs    []string `json:"subs,omitempty"`
	Region  Region   `json:"region,omitempty"`
	Color   string   `json:"color,omitempty"`
}

// Tournament x
type Tournament struct {
	// TODO move this to Regions so we can have multiple
	Region Region `json:"region"`
	Season string `json:"season"`
	Name   string `json:"name"`
	Start  string `json:"start"`
	End    string `json:"end"`
	Teams  []Team `json:"teams"`
}

// TournamentLPMetadata stores metadata that is only needed in relation to Liquipedia
type TournamentLPMetadata struct {
	// ParticipationSection indicates the section index that corresponds to the "Participants" section on the Tournament LP page
	ParticipationSection int `json:"participantSection"`
}

// Section x
type Section struct {
	Name        string       `json:"name"`
	Tournaments []Tournament `json:"tournaments"`
}

// RlcsSeason x
type RlcsSeason struct {
	Season   string    `json:"season"`
	Sections []Section `json:"sections"`
}

// Region is represented by an 8-bit unsigned int
type Region uint8

// Defined regions
const (
	RegionNone Region = iota
	RegionWorld
	RegionNorthAmerica
	RegionEurope
	RegionOceania
	RegionSouthAmerica
)

func (r Region) String() string {
	switch r {
	case RegionNone:
		return "None"
	case RegionWorld:
		return "World"
	case RegionNorthAmerica:
		return "North America"
	case RegionEurope:
		return "Europe"
	case RegionOceania:
		return "Oceania"
	case RegionSouthAmerica:
		return "South America"
	}
	return ""
}

// Membership is a team membership for a player
type Membership struct {
	Join  string `json:"join"`
	Leave string `json:"leave"`
	Team  string `json:"team"`
}

// Player has a name and set of memberships
type Player struct {
	Memberships  []Membership `json:"memberships"`
	Name         string       `json:"name"`
	AlternateIDs []string     `json:"alternateIDs"`
}
