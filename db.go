package main

import (
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var client *mongo.Client
var db *mongo.Database

const passwordKey = "DB_PASSWORD"

// InitializeClient initializes the mongo DB client
func InitializeClient() {
	password, present := os.LookupEnv(passwordKey)
	if !present {
		file, err := os.Open("password")
		if err != nil {
			fmt.Println("Unable to open db file", err)
			os.Exit(1)
		}
		byteValue, _ := ioutil.ReadAll(file)
		password = string(byteValue)
	}

	var err error

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err = mongo.Connect(ctx, options.Client().ApplyURI(
		fmt.Sprintf("mongodb+srv://dbUser:%s@cluster0.xhiax.mongodb.net/rlesports?retryWrites=true&w=majority", password),
	))
	if err != nil {
		log.Fatal(err)
	}

	db = client.Database("rlesports")
}

// UploadTournaments uploads all given tournaments
func UploadTournaments(data []Tournament) {
	tournaments := db.Collection("tournaments-test")

	models := make([]mongo.WriteModel, len(data))

	for _, tournament := range data {
		models = append(models, mongo.NewReplaceOneModel().SetFilter(bson.M{"name": tournament.Name}).SetReplacement(tournament).SetUpsert(true))
	}

	tournaments.BulkWrite(context.Background(), models)
}

// GetTournaments returns a list of all tournaments in the db
func GetTournaments() []Tournament {
	tournaments := db.Collection("tournaments")
	cur, err := tournaments.Find(context.Background(), bson.D{})
	if err != nil {
		fmt.Println("Failed to find", err)
		os.Exit(1)
	}

	var results []Tournament
	if err = cur.All(context.TODO(), &results); err != nil {
		log.Fatal(err)
	}

	return results
}
