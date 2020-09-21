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

// Unsorted list of all tournaments
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
	InitializeClient()

	if (len(os.Args) == 2 || len(os.Args) == 3) && os.Args[1] == "update" {
		// Test area
		/*
			f, err := os.Open("logo.png")
			if err != nil {
				log.Fatal("can't open image")
			}

			img, err := png.Decode(f) // image.Decode(f)
			if err != nil {
				log.Fatal("can't decode image")
			}
			f.Close()

			res, err := prominentcolor.Kmeans(img)
			if err != nil {
				log.Fatal("can't process image")
			}

			fmt.Println("colors:")
			for _, color := range res {
				fmt.Println("#" + color.AsString())
			}
		*/
		UpdateTournaments(len(os.Args) == 3 && os.Args[2] == "--force")
	} else {
		port := os.Getenv("PORT")

		if port == "" {
			port = "5002"
		}

		fmt.Println("mongo client initialized")

		http.HandleFunc("/api/tournaments", tournaments)
		http.HandleFunc("/", home)

		fmt.Println("About to use port", port)

		http.ListenAndServe(":"+port, nil)
	}
}
