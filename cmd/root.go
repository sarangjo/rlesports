package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var (
	rootCmd = &cobra.Command{
		Use:   "rlesports",
		Short: "RLEsports backend",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Println("Welcome to RL Esports!")
		},
	}
)

func Execute() error {
	return rootCmd.Execute()
}

func init() {
	// cobra.OnInitialize()

	rootCmd.AddCommand(serverCmd)
	rootCmd.AddCommand(fetchCmd)
}
