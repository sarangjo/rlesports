package rlesports

type Storage interface {
	GetTournament(*Tournament, *TournamentLPMetadata) error
	SaveTournament(Tournament, TournamentLPMetadata)
}
