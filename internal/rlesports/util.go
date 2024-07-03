package rlesports

import (
	"encoding/json"
	"fmt"
	"os"
)

// WriteJSONFile writes any type of output to the specified file
func WriteJSONFile(output interface{}, filename string) error {
	outputBytes, err := json.MarshalIndent(output, "", "  ")
	if err != nil {
		fmt.Println("Unable to marshal output", err)
		return err
	}
	err = os.WriteFile(filename, outputBytes, 0644)
	if err != nil {
		fmt.Println("Unable to write out tournaments cache file", err)
		return err
	}
	return nil
}
