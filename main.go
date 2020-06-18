package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

const inServerMode = true

func home(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello, world!")
}

func tournaments(w http.ResponseWriter, r *http.Request) {
	fmt.Println("tournaments")

	t := GetTournaments()

	bytes, err := json.Marshal(t)
	if err != nil {
		fmt.Println("Unable to marshal tournaments")
		os.Exit(1)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(bytes)
}

func main() {
	if inServerMode {
		port := os.Getenv("PORT")

		if port == "" {
			port = "5001"
		}

		InitializeClient()

		fmt.Println("mongo client initialized")

		http.HandleFunc("/api/tournaments", tournaments)
		http.HandleFunc("/", home)

		fmt.Println("About to use port", port)

		http.ListenAndServe(":"+port, nil)
	} else {
		output := GetTournamentsData()
		ProcessTournamentsData(output)
	}
}
