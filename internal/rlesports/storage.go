package rlesports

type Storage interface {
	GetTournament(*Tournament, *TournamentLPMetadata) error
	SaveTournament(Tournament, TournamentLPMetadata)
	GetAllTournaments() []Tournament

	GetProcessedPlayers() ([]string, error)
	GetPlayerNames() (map[string]string, error)
	SaveProcessedPlayers([]string)
	SavePlayerNames(map[string]string)
}
