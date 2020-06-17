package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

const inServerMode = false

func home(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello, world!")
}

func tournaments(w http.ResponseWriter, r *http.Request) {
	t := GetTournaments()

	bytes, err := json.Marshal(t)
	if err != nil {
		fmt.Println("Unable to marshal tournaments")
		os.Exit(1)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(bytes)
}

func main() {
	if inServerMode {
		port := os.Getenv("PORT")

		if port == "" {
			port = "5001"
			fmt.Println("FYI, using port", port)
		}

		InitializeClient()

		http.HandleFunc("/api/tournaments", tournaments)
		http.HandleFunc("/", home)
		http.ListenAndServe(":"+port, nil)
	} else {
		GetTournamentsData()
		// data := ProcessTournamentsData(output)
		// fmt.Println(data)
	}
}
