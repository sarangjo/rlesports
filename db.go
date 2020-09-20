package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var client *mongo.Client
var db *mongo.Database

const passwordKey = "DB_PASSWORD"

func getDbSrv() string {
	// return fmt.Sprintf("mongodb+srv://dbUser:%s@cluster0.xhiax.mongodb.net/rlesports?retryWrites=true&w=majority", password)
	return "mongodb://localhost:27017"
}

// InitializeClient initializes the mongo DB client
func InitializeClient() {
	var err error

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err = mongo.Connect(ctx, options.Client().ApplyURI(getDbSrv()))
	if err != nil {
		fmt.Println("Unable to connect", err)
		os.Exit(1)
	}

	db = client.Database("rlesports")
}

// UploadTournaments uploads all given tournaments
func UploadTournaments(data []Tournament) {
	tournaments := db.Collection("tournaments")

	models := make([]mongo.WriteModel, len(data))

	for _, tournament := range data {
		models = append(models, mongo.NewReplaceOneModel().SetFilter(bson.M{"name": tournament.Name}).SetReplacement(tournament).SetUpsert(true))
	}

	tournaments.BulkWrite(context.Background(), models)
}

// GetTournaments returns a list of all tournaments in the db
func GetTournaments() []Tournament {
	tournaments := db.Collection("tournaments")
	opts := options.Find().SetSort(bson.D{primitive.E{Key: "start", Value: 1}})
	cur, err := tournaments.Find(context.Background(), bson.D{}, opts)
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

// GetTournament gets a single tournament by name
func GetTournament(t *Tournament) error {
	tournaments := db.Collection("tournaments")
	filter := bson.M{"name": t.Name}
	doc := tournaments.FindOne(context.Background(), filter)

	if err := doc.Decode(t); err != nil {
		log.Fatal(err)
		return err
	}

	return nil
}

// UploadTournament uploads tournament by name
func UploadTournament(t Tournament) {
	tournaments := db.Collection("tournaments")

	opts := options.Replace().SetUpsert(true)
	filter := bson.M{"name": t.Name}
	result, err := tournaments.ReplaceOne(context.Background(), filter, t, opts)
	if err != nil {
		log.Fatal(err)
	}

	if result.MatchedCount != 0 {
		fmt.Println("matched and replaced an existing document")
		return
	}
	if result.UpsertedCount != 0 {
		fmt.Printf("inserted a new document with ID %v\n", result.UpsertedID)
	}
}
