package rlesports

func UpdatePlayerNames(storage Storage) {
	// Given the current tournaments, go through and fetch relevant players' alternate names. We use
	// the Liquipedia article title as the "canonical" name and create a map of all non-canonical
	// names to the canonical name (basically an inverse of the mapping data found on the player's
	// Liquipedia page)

	// Players processed is names that are within tournament team rosters
	var processedPlayersArr []string
	processedPlayersArr, err := storage.GetProcessedPlayers()
	if err != nil {
		processedPlayersArr = make([]string, 0)
	}
	processedPlayers := make(map[string]bool)
	for _, pn := range processedPlayersArr {
		processedPlayers[pn] = true
	}

	// The values of playerNames are the canonical page names on Liquipedia
	var playerNames map[string]string
	playerNames, err = storage.GetPlayerNames()
	if err != nil {
		playerNames = make(map[string]string)
	}

	tournaments := storage.GetAllTournaments()

	for _, tourney := range tournaments {
		for _, team := range tourney.Teams {
			for _, playerName := range team.Players {
				if processedPlayers[playerName] {
					continue
				}

				processedPlayers[playerName] = true
				wikitext := FetchPlayer(playerName)

				// First check if it's a redirect
				if ok, to := IsRedirectTo(wikitext); ok {
					// Populate map
					playerNames[playerName] = to
				} else {
					player := ParsePlayer(wikitext)

					for _, alt := range player.AlternateIDs {
						playerNames[alt] = player.Name
					}
				}
			}
		}
	}

	// Map back to array
	processedPlayersArr = make([]string, 0, len(processedPlayers))
	for p := range processedPlayers {
		processedPlayersArr = append(processedPlayersArr, p)
	}

	storage.SaveProcessedPlayers(processedPlayersArr)
	storage.SavePlayerNames(playerNames)
}
