package cmd

import (
	"log"

	"github.com/sarangjo/rlesports/internal/rlesports"
	"github.com/spf13/cobra"
)

var jsonStorage rlesports.JsonStorage

var clientCmd = &cobra.Command{
	Use: "client",
	Run: func(cmd *cobra.Command, args []string) {
		switch args[0] {
		case "updateall":
			rlesports.UpdateTournaments(jsonStorage, false)
		case "update":
			if len(args) < 2 {
				log.Fatalf("Not enough arguments provided")
			}
			t := rlesports.Tournament{
				Name: args[1],
			}
			rlesports.GetTournament(&t, -1)
			rlesports.JsonSaveTournament(t)
		case "refreshjson":
			t, err := rlesports.JsonGetTournaments()
			if err != nil {
				log.Fatalf("Could not get tournaments from JSON")
			}
			rlesports.JsonSaveTournaments(t)
		}
	},
}
