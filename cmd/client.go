package cmd

import (
	"log"

	"github.com/sarangjo/rlesports/internal/rlesports"
	"github.com/spf13/cobra"
)

var clientCmd = &cobra.Command{
	Use: "client",
	Run: func(cmd *cobra.Command, args []string) {
		switch args[0] {
		case "update":
			if len(args) < 2 {
				log.Fatalf("Not enough arguments provided")
			}
			t := rlesports.GetTournament(args[1], -1)
			rlesports.JsonSaveTournament(t)
		}
	},
}