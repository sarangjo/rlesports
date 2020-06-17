package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"strconv"
)

const apiBase = "https://liquipedia.net/rocketleague/api.php"
const userAgent = "RL Esports"

var httpClient = &http.Client{}

type parseData interface{}

type sectionsParseData struct {
	Title    string                   `json:"title"`
	PageID   int                      `json:"pageid"`
	Sections []map[string]interface{} `json:"sections"`
}

type parseResult struct {
	Parse parseData `json:"parse"`
}

type getSectionsParseResult struct {
	Parse sectionsParseData `json:"parse"`
}

// GetSection gets the section wikitext for the given page and section
func GetSection(page string, section int) map[string]interface{} {
	opts := url.Values{
		"action":  {"parse"},
		"prop":    {"wikitext"},
		"page":    {page},
		"section": {strconv.Itoa(section)},
	}
	var res parseResult
	resp := CallAPI(opts)
	fmt.Println(string(resp))
	json.Unmarshal(resp, &res)
	return res.Parse.(map[string]interface{})
}

// GetSections gets all sections for the given page
func GetSections(page string) []map[string]interface{} {
	opts := url.Values{
		"action": {"parse"},
		"prop":   {"sections"},
		"page":   {page},
	}
	var res getSectionsParseResult
	resp := CallAPI(opts)
	json.Unmarshal(resp, &res)
	return res.Parse.Sections
}

// CallAPI calls Liquipedia API
func CallAPI(opts url.Values) []byte {
	u, err := url.Parse(apiBase)
	if err != nil {
		fmt.Println("Could not parse api base... wut?")
		os.Exit(1)
	}
	opts.Set("origin", "*")
	opts.Set("format", "json")
	req, err := http.NewRequest(http.MethodGet, fmt.Sprintf("%s?%s", u.String(), opts.Encode()), nil)
	if err != nil {
		fmt.Println("Failed to create request")
	}
	req.Header.Add("user-agent", userAgent)

	resp, err := httpClient.Do(req)
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

	return body
}
