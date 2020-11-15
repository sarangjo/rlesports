package main

// Try to keep this in sync with `types.ts` in the frontend please.

// Team is a single team
type Team struct {
	Name    string   `json:"name"`
	Players []string `json:"players"`
	Subs    []string `json:"subs"`
	Region  Region   `json:"region,omitempty"`
}

// Tournament x
type Tournament struct {
	// TODO move this to Regions so we can have multiple
	Region Region `json:"region"`
	Path   string `json:"path"`
	Start  string `json:"start"`
	End    string `json:"end"`
	Teams  []Team `json:"teams"`
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

// OldTournament describes, well, a tournament
type OldTournament struct {
	// Metadata
	Season string `json:"season"`
	Region Region `json:"region,omitempty"`
	Index  int    `json:"index"`
	// Name
	Name string `json:"name"`
	// LP data
	Start string `json:"start"`
	End   string `json:"end,omitempty"`
	Teams []Team `json:"teams"`
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
