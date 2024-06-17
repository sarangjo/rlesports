package rlesports

// Lightweight wrappers around Liquipedia API calls

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"time"
)

const apiBase = "https://liquipedia.net/rocketleague/api.php"
const userAgent = "RL Esports"
const rateGap time.Duration = time.Second * 30

var httpClient = &http.Client{}
var lastRequest = time.Unix(0, 0)

type parseResult struct {
	Parse interface{} `json:"parse"`
}

// FetchPlayer gets player information. If we find a redirect, return it as first parameter; otherwise
// it is empty string.
func FetchPlayer(player string) interface{} {
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

	return res.Parse
}

// FetchSection gets the section wikitext for the given page and section
func FetchSection(page string, section int) string {
	opts := url.Values{
		"action":  {"parse"},
		"prop":    {"wikitext"},
		"page":    {page},
		"section": {strconv.Itoa(section)},
	}
	var res parseResult
	resp := CallAPI(opts)
	json.Unmarshal(resp, &res)
	fullSection := res.Parse.(map[string]interface{})
	return fullSection["wikitext"].(map[string]interface{})["*"].(string)
}

// FetchSections gets all sections for the given page
func FetchSections(page string) []map[string]interface{} {
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

// CallAPI calls Liquipedia API
func CallAPI(opts url.Values) []byte {
	// Rate limit
	timeSinceLast := time.Since(lastRequest)
	if timeSinceLast < rateGap {
		fmt.Printf("waiting for %v\n", (rateGap - timeSinceLast).Round(time.Second))
		for time.Since(lastRequest) < rateGap {
			time.Sleep(time.Second * 5)
			fmt.Print(".")
		}
		fmt.Println()
	}

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

	lastRequest = time.Now()

	return body
}
