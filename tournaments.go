package main

// Team is a single team
type Team struct {
	Players []string `json:"players"`
	Subs    []string `json:"subs"`
	Name    string   `json:"name"`
}

// Tournament describes, well, a tournament
type Tournament struct {
	Name  string `json:"name"`
	Teams []Team `json:"teams"`
}
