package rlesportsdb

import "github.com/sarangjo/rlesports/internal/rlesports"

// TournamentDoc describes a tournament as stored in the db
type TournamentDoc struct {
	// Metadata
	Season string           `json:"season"`
	Region rlesports.Region `json:"region,omitempty"`
	Index  int              `json:"index"`
	// Liquipedia-specific details (cached so as to save API calls)
	ParticipationSection int `json:"participantSection"`
	// Name
	Name string `json:"name"`
	// LP data
	Start string           `json:"start"`
	End   string           `json:"end,omitempty"`
	Teams []rlesports.Team `json:"teams"`
}
