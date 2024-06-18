package cmd

import (
	"github.com/sarangjo/rlesports/internal/rlesports"
	"github.com/spf13/cobra"
)

var fetchCmd = &cobra.Command{
	Use: "fetch",
	Run: func(cmd *cobra.Command, args []string) {
		t := rlesports.GetTournament(args[0], -1)
		rlesports.JsonSaveTournament(t)
	},
}
