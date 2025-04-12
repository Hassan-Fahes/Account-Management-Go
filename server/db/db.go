package db

import (
	"context"
	"log"
	"time"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)


var client *mongo.Client


func Connect() {
	var err error
	client, err = mongo.NewClient(options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal(err)
	}

	
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Connected to MongoDB!")
}


func Disconnect() {
	err := client.Disconnect(context.Background())
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Disconnected from MongoDB")
}

// GetUserCollection 
// func GetUserCollection() *mongo.Collection {
// 	return client.Database("account_management").Collection("users")
// }

// func AccountCollection() *mongo.Collection {
// 	return client.Database("account_management").Collection("accounts")
// }

