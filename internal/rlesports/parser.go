package rlesports

import (
	"fmt"
	"os"
	"regexp"
	"strconv"
	"strings"
)

/* Wikitext parsing module */

var (
	// [[Rocket_League_Championship_Series/Season_1/North_America/Qualifier_1|Qualifier #1]]
	wikilinkRegex   = regexp.MustCompile(`\[\[.+\|(.+)\]\]`)
	playerLineRegex = regexp.MustCompile(`[|]p[0-9]=`)
	subLineRegex    = regexp.MustCompile(`[|]sub[0-9]=`)
	dateRegex       = regexp.MustCompile("[\\w?]{4}-[\\w?]{2}-[\\w?]{2}")
)

// ParseTeams parses team info. tournamentRegion is provided to set the individual region of teams
// that don't have regions of their own.
func ParseTeams(wikitext string, tournamentRegion Region) []Team {
	// We are processing all of the lines per tournament
	lines := strings.Split(wikitext, "\n")
	// Each tournament has a set of teams
	teams := []Team{}
	// These are used as we parse one team at a time
	team := Team{}
	foundTeam := false

	if tournamentRegion != RegionWorld {
		team.Region = tournamentRegion
	}

	// Line format is:
	// |team=iBUYPOWER
	// |p1=Kronovi |p1flag=us
	// |p2=Lachinio |p2flag=ca
	// |p3=Gambit |p3flag=us
	// |p4=0ver Zer0|p4flag=us
	// |qualifier=[[Rocket_League_Championship_Series/Season_1/North_America/Qualifier_1|Qualifier #1]]
	for _, line := range lines {
		// This divides teams, so we save the team we've been collecting so far
		if strings.HasPrefix(line, "|team") {
			// Handle special case for the first team
			if foundTeam && len(team.Players) >= minTeamSize {
				teams = append(teams, team)
				team = Team{}
				if tournamentRegion != RegionWorld {
					team.Region = tournamentRegion
				}
			}
			team.Name = strings.Replace(line, "|team=", "", 1)
			if endBar := strings.Index(team.Name, "|"); endBar >= 0 {
				team.Name = team.Name[0:endBar]
			}
			foundTeam = true
			// Once we've found a team, parse at least 3 players
		} else if foundTeam {
			// Player line has to start as so:
			// TODO: start with `^`? replace [|] with `|?`?
			if res := playerLineRegex.MatchString(line); res {
				player := strings.TrimSpace(strings.Split(strings.Split(line, "|")[1], "=")[1])
				if len(player) > 0 {
					team.Players = append(team.Players, player)
				}
			} else if res := subLineRegex.MatchString(line); res {
				player := strings.TrimSpace(strings.Split(strings.Split(line, "|")[1], "=")[1])
				if len(player) > 0 {
					team.Subs = append(team.Subs, player)
				}
			} else {
				if tournamentRegion == RegionWorld {
					if strings.Contains(line, "|qualifier") {
						pieces := strings.Split(line, "=")
						qualifier := strings.TrimSpace(pieces[1])

						// Strip away any links
						if res := wikilinkRegex.FindStringSubmatch(qualifier); res != nil {
							qualifier = res[1]
						}

						// TODO expand
						if strings.Contains(qualifier, RegionNorthAmerica.String()) {
							team.Region = RegionNorthAmerica
						} else if strings.Contains(qualifier, RegionEurope.String()) {
							team.Region = RegionEurope
						} else if strings.Contains(qualifier, RegionOceania.String()) {
							team.Region = RegionOceania
						}
					}
				}
			}
		}
	}

	// Fencepost for the last team
	if len(team.Players) >= minTeamSize {
		teams = append(teams, team)
	}

	return teams
}

const (
	typeOnline  = "Online"
	typeOffline = "Offline"
)

// ParseStartEndRegion get start, end, region of tournament, or returns empty
func ParseStartEndRegion(wikitext string) (string, string, Region) {
	lines := strings.Split(wikitext, "\n")

	inInfobox := false

	start := ""
	end := ""
	tType := typeOffline
	country := ""

	for _, line := range lines {
		if strings.HasPrefix(line, "{{Infobox") {
			inInfobox = true
		} else if inInfobox {
			if strings.HasPrefix(line, "|sdate=") {
				start = strings.Replace(line, "|sdate=", "", 1)
			} else if strings.HasPrefix(line, "|edate=") {
				end = strings.Replace(line, "|edate=", "", 1)
			} else if strings.HasPrefix(line, "|type=") {
				tType = strings.Replace(line, "|type=", "", 1)
			} else if strings.HasPrefix(line, "|country=") {
				country = strings.Replace(line, "|country=", "", 1)
			}
		}
	}

	region := RegionNone
	if tType == typeOffline {
		region = RegionWorld
	} else if country == RegionNorthAmerica.String() {
		region = RegionNorthAmerica
	} else if country == RegionEurope.String() {
		region = RegionEurope
	} else if country == RegionOceania.String() {
		region = RegionOceania
	}

	return start, end, region
}

// ParsePlayer parses player from wikitext
func ParsePlayer(wikitext string) Player {
	lines := strings.Split(wikitext, "\n")

	player := Player{Memberships: []Membership{}}

	inInfobox := false
	inHistory := false

	for _, line := range lines {
		if strings.HasPrefix(line, "{{Infobox") {
			inInfobox = true
		} else if inInfobox {
			if strings.HasPrefix(line, "|id=") {
				player.Name = strings.TrimSpace(strings.Replace(line, "|id=", "", 1))
			} else if strings.HasPrefix(line, "|ids=") {
				alternateIDs := strings.Split(strings.Replace(line, "|ids=", "", 1), ", ")
				for _, id := range alternateIDs {
					if id != "" {
						player.AlternateIDs = append(player.AlternateIDs, id)
					}
				}
			}
		}

		if !inHistory && strings.HasPrefix(line, "|history") {
			inHistory = true
		} else if inHistory {
			if !strings.HasPrefix(line, "{{TH") {
				break
			}

			parts := strings.Split(strings.ReplaceAll(strings.ReplaceAll(line, "{{", ""), "}}", ""), "|")
			dates := strings.Fields(parts[1])
			membership := Membership{Join: strings.TrimSpace(dates[0]), Team: strings.TrimSpace(parts[2])}
			if len(dates) >= 3 {
				if dateRegex.MatchString(dates[2]) {
					membership.Leave = strings.TrimSpace(dates[2])
				}
			}
			// Verify that both Join/Leave don't have ?'s
			if strings.IndexByte(membership.Join, '?') < 0 && strings.IndexByte(membership.Leave, '?') < 0 {
				player.Memberships = append(player.Memberships, membership)
			}
		}
	}
	return player
}

func ExtractWikitext(src interface{}) string {
	return src.(map[string]interface{})["wikitext"].(map[string]interface{})["*"].(string)
}

// #REDIRECT [[Turbopolsa]]
var redirectRegex = regexp.MustCompile(`(?i)#REDIRECT.*\[\[(.*)\]\]`) // [[(.*)]]`)

func IsRedirectTo(wikitext string) (bool, string) {
	res := redirectRegex.FindStringSubmatch(wikitext)
	if res != nil {
		return true, res[1]
	}
	return false, ""
}

// FindSectionIndex finds the section that has `participants` as the line/anchor
func FindSectionIndex(sections []map[string]interface{}, sectionTitle string) int {
	for _, section := range sections {
		if strings.Contains(strings.ToLower(section["line"].(string)), sectionTitle) ||
			strings.Contains(strings.ToLower(section["anchor"].(string)), sectionTitle) {
			num, err := strconv.Atoi(section["index"].(string))
			if err != nil {
				fmt.Println("Unable to convert index to number", err)
				os.Exit(1)
			}
			return num
		}
	}
	return -1
}
