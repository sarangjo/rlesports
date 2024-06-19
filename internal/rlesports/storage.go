package rlesports

type Storage interface {
	GetTournament(*Tournament, *TournamentLPMetadata) error
	UploadTournament(Tournament, TournamentLPMetadata)
}
