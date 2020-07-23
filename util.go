package main

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

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
