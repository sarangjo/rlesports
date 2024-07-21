package rlesports

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"os"
)

/* JSON file based data storage */

const (
	playerNamesFilename = "src/data/playerNames.json"
	tournamentsFilename = "src/data/tournaments.json"
)
const (
	processedPlayersFilename    = "cache/processedPlayers.json"
	tournamentsMetadataFileName = "cache/tournamentsMetadata.json"
)

const indent = "  "

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
	data, err := json.MarshalIndent(tournaments, "", indent)
	if err != nil {
		log.Fatalf("failed to marshal into json: %v", err)
	}

	err = os.WriteFile(tournamentsFilename, data, fs.FileMode(0644))
	if err != nil {
		log.Fatalf("failed to write json data: %v", err)
	}
}

func JsonGetAllTournamentMetadata() (metadataMap map[string]TournamentLPMetadata, err error) {
	data, err := os.ReadFile(tournamentsMetadataFileName)
	if err != nil {
		return nil, err
	}

	metadataMap = make(map[string]TournamentLPMetadata)
	err = json.Unmarshal(data, &metadataMap)
	if err != nil {
		return nil, err
	}

	return metadataMap, nil
}

func JsonGetTournamentMetadata(name string) (metadata TournamentLPMetadata, err error) {
	metadataMap, err := JsonGetAllTournamentMetadata()
	if err != nil {
		return TournamentLPMetadata{}, err
	}

	if metadata, ok := metadataMap[name]; ok {
		return metadata, nil
	}
	return TournamentLPMetadata{}, fmt.Errorf("no metadata found for %v", name)
}

func JsonSaveTournamentMetadata(name string, metadata TournamentLPMetadata) {
	metadataMap, err := JsonGetAllTournamentMetadata()
	if err != nil {
		metadataMap = make(map[string]TournamentLPMetadata)
	}

	metadataMap[name] = metadata

	JsonSaveAllTournamentMetadata(metadataMap)
}

func JsonSaveAllTournamentMetadata(metadataMap map[string]TournamentLPMetadata) {
	data, err := json.MarshalIndent(metadataMap, "", indent)
	if err != nil {
		log.Fatalf("failed to marshal into json: %v", err)
	}

	err = os.WriteFile(tournamentsMetadataFileName, data, fs.FileMode(0644))
	if err != nil {
		log.Fatalf("failed to write json data: %v", err)
	}
}

func JsonGetProcessedPlayers() (processedPlayers []string, err error) {
	data, err := os.ReadFile(processedPlayersFilename)
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(data, &processedPlayers)
	if err != nil {
		return nil, err
	}

	return processedPlayers, nil
}

func JsonGetPlayerNames() (playerNames map[string]string, err error) {
	data, err := os.ReadFile(playerNamesFilename)
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(data, &playerNames)
	if err != nil {
		return nil, err
	}

	return playerNames, nil
}

func JsonSaveProcessedPlayers(processedPlayers []string) {
	data, err := json.MarshalIndent(processedPlayers, "", indent)
	if err != nil {
		log.Fatalf("failed to marshal into json: %v", err)
	}

	err = os.WriteFile(processedPlayersFilename, data, fs.FileMode(0644))
	if err != nil {
		log.Fatalf("failed to write json data: %v", err)
	}
}

func JsonSavePlayerNames(playerNames map[string]string) {
	data, err := json.MarshalIndent(playerNames, "", indent)
	if err != nil {
		log.Fatalf("failed to marshal into json: %v", err)
	}

	err = os.WriteFile(playerNamesFilename, data, fs.FileMode(0644))
	if err != nil {
		log.Fatalf("failed to write json data: %v", err)
	}
}

type JsonStorage struct {
}

func (js JsonStorage) GetTournament(tournament *Tournament, metadata *TournamentLPMetadata) error {
	// Tournament
	tournaments, err := JsonGetTournaments()
	if err != nil {
		return err
	}

	// Find the requested tournament
	for _, t := range tournaments {
		if t.Name == tournament.Name {
			tournament.Start = t.Start
			tournament.End = t.End
			tournament.Teams = t.Teams
			break
		}
	}

	// Metadata
	*metadata, err = JsonGetTournamentMetadata(tournament.Name)
	if err != nil {
		return err
	}

	return nil
}

func (js JsonStorage) SaveTournament(tournament Tournament, metadata TournamentLPMetadata) {
	JsonSaveTournament(tournament)
	JsonSaveTournamentMetadata(tournament.Name, metadata)
}

func (js JsonStorage) GetAllTournaments() (tournaments []Tournament) {
	tournaments, err := JsonGetTournaments()
	if err != nil {
		return make([]Tournament, 0)
	}
	return tournaments
}

func (js JsonStorage) GetProcessedPlayers() ([]string, error) {
	return JsonGetProcessedPlayers()
}

func (js JsonStorage) GetPlayerNames() (map[string]string, error) {
	return JsonGetPlayerNames()
}

func (js JsonStorage) SaveProcessedPlayers(processedPlayers []string) {
	JsonSaveProcessedPlayers(processedPlayers)
}

func (js JsonStorage) SavePlayerNames(playerNames map[string]string) {
	JsonSavePlayerNames(playerNames)
}
