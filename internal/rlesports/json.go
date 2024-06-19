package rlesports

import (
	"encoding/json"
	"io/fs"
	"log"
	"os"
)

const (
	playersFilename     = "src/data/players.json"
	tournamentsFilename = "src/data/tournaments.json"
)

func JsonGetTournaments() (tournaments []Tournament, err error) {
	data, err := os.ReadFile(tournamentsFilename)
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(data, &tournaments)
	if err != nil {
		return nil, err
	}
	return tournaments, nil
}

func JsonSaveTournament(tournament Tournament) {
	tournaments, err := JsonGetTournaments()
	if err != nil {
		tournaments = make([]Tournament, 0)
	}

	found := false
	for i, t := range tournaments {
		if t.Name == tournament.Name {
			tournaments[i] = tournament
			found = true
			break
		}
	}

	if !found {
		tournaments = append(tournaments, tournament)
	}

	JsonSaveTournaments(tournaments)
}

func JsonSaveTournaments(tournaments []Tournament) {
	data, err := json.MarshalIndent(tournaments, "", "  ")
	if err != nil {
		log.Fatalf("failed to marshal into json: %v", err)
	}

	err = os.WriteFile(tournamentsFilename, data, fs.FileMode(0644))
	if err != nil {
		log.Fatalf("failed to write json data: %v", err)
	}
}
