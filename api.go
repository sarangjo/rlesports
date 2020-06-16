package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
)

const apiBase = "https://liquipedia.net/rocketleague/api.php"

// CallAPI calls Liquipedia API
func CallAPI(opts map[string]string, result *interface{}) {
	u, err := url.Parse(apiBase)
	if err != nil {
		fmt.Println("Could not parse api base... wut?")
		os.Exit(1)
	}

	for key, val := range opts {
		u.Query().Set(key, val)
	}

	resp, err := http.Get(u.String())
	if err != nil {
		fmt.Println("Failed to get API", err)
		os.Exit(1)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Failed to read body", err)
		os.Exit(1)
	}

	json.Unmarshal(body, result)
}
