package rlesports

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
)

// WriteJSONFile writes any type of output to the specified file
func WriteJSONFile(output interface{}, filename string) error {
	outputBytes, err := json.MarshalIndent(output, "", "  ")
	if err != nil {
		fmt.Println("Unable to marshal output", err)
		return err
	}
	err = ioutil.WriteFile(filename, outputBytes, 0644)
	if err != nil {
		fmt.Println("Unable to write out tournaments cache file", err)
		return err
	}
	return nil
}
