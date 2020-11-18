package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
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

func main() {
	InitializeClient()

	if len(os.Args) > 1 {
		switch os.Args[1] {
		case "update":
			UpdateTournaments(len(os.Args) == 3 && os.Args[2] == "--force")
			break
		case "players":
			SmarterPlayers()
			break
		case "cache":
			CacheProcess()
			break
		case "test":
			l := map[string]map[string]string{
				"wikitext": {
					"*": "#REDIRECT [[Turbopolsa]]",
				},
			}
			fmt.Println(redirectTo(l))
			break
		}
	} else {
		port := os.Getenv("PORT")

		if port == "" {
			port = "5002"
		}

		fmt.Println("mongo client initialized")

		http.HandleFunc("/api/tournaments", func(w http.ResponseWriter, r *http.Request) { handle(w, r, GetTournaments()) })
		http.HandleFunc("/api/seasons", func(w http.ResponseWriter, r *http.Request) { handle(w, r, GetSeasons()) })
		http.HandleFunc("/", home)

		fmt.Println("About to use port", port)

		http.ListenAndServe(":"+port, nil)
	}
}
