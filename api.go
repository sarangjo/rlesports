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

type parseResult struct {
	Parse interface{} `json:"parse"`
}

// GetPlayer gets player information
func GetPlayer(player string) map[string]interface{} {
	opts := url.Values{
		"action":  {"parse"},
		"prop":    {"wikitext"},
		"page":    {player},
		"format":  {"json"},
		"section": {"0"},
	}
	var res parseResult
	resp := CallAPI(opts)
	json.Unmarshal(resp, &res)
	return res.Parse.(map[string]interface{})
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
	var res parseResult
	resp := CallAPI(opts)
	json.Unmarshal(resp, &res)

	// Can't type assert a slice
	rawSections := res.Parse.(map[string]interface{})["sections"].([]interface{})
	sections := make([]map[string]interface{}, 0, len(rawSections))
	for _, raw := range rawSections {
		sections = append(sections, raw.(map[string]interface{}))
	}
	return sections
}

// GetWiki to get wiki
func GetWiki(page string, sectionTitle string) map[string]interface{} {
	allSections := GetSections(page)
	sectionIndex := FindSectionIndex(allSections, sectionTitle)

	if sectionIndex < 0 {
		return nil
	}

	return GetSection(page, sectionIndex)
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
