package cmd

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/sarangjo/rlesports/internal/rlesports"
	"github.com/sarangjo/rlesports/internal/rlesportsdb"
	"github.com/spf13/cobra"
)

func home(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello, world!")
}

func handle(w http.ResponseWriter, r *http.Request, x interface{}) {
	bytes, err := json.Marshal(x)
	if err != nil {
		fmt.Println("Unable to marshal tournaments")
		os.Exit(1)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(bytes)
}

var serverCmd = &cobra.Command{
	Use: "server",
	Run: func(cmd *cobra.Command, args []string) {
		rlesportsdb.InitializeClient()

		switch args[0] {
		case "players":
			rlesportsdb.SmarterPlayers()
		case "cache":
			rlesportsdb.CacheProcess()
		case "test":
			l := map[string]map[string]string{
				"wikitext": {
					"*": "#REDIRECT [[Turbopolsa]]",
				},
			}
			fmt.Println(rlesports.IsRedirectTo(l))
		case "serve":
			port := os.Getenv("PORT")

			if port == "" {
				port = "5002"
			}

			fmt.Println("mongo client initialized")

			http.HandleFunc("/api/tournaments", func(w http.ResponseWriter, r *http.Request) { handle(w, r, rlesportsdb.GetTournaments()) })
			http.HandleFunc("/api/seasons", func(w http.ResponseWriter, r *http.Request) { handle(w, r, rlesportsdb.GetSeasons()) })
			http.HandleFunc("/", home)

			fmt.Println("About to use port", port)

			http.ListenAndServe(":"+port, nil)
		}
	},
}
