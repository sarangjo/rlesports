package main

// Team is a single team
type Team struct {
	Name    string   `json:"name"`
	Players []string `json:"players"`
	Subs    []string `json:"subs"`
}

// Tournament describes, well, a tournament
type Tournament struct {
	Name   string `json:"name"`
	Start  string `json:"start"`
	End    string `json:"end,omitempty"`
	Teams  []Team `json:"teams"`
	Region int    `json:"region,omitempty"`
}

// Regions
const (
	RegionNone = iota
	RegionWorld
	RegionNorthAmerica
	RegionEurope
	RegionOceania
	RegionSouthAmerica
)
