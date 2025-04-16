package db

import (
	"account/server/models"
	"context"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetAllOtherAccounts() ([]models.Account, error) {
	collection := client.Database("account_management").Collection("accounts_2")
	var accounts []models.Account

	cursor, err := collection.Find(context.TODO(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.TODO())

	for cursor.Next(context.TODO()) {
		var account models.Account
		if err := cursor.Decode(&account); err != nil {
			return nil, err
		}
		accounts = append(accounts, account)
	}

	return accounts, nil
}

func AddAccount_2(account models.Account) (*mongo.InsertOneResult, error) {
	collection := client.Database("account_management").Collection("accounts_2")

	result, err := collection.InsertOne(context.TODO(), account)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func DeleteAccount_2(accountID string) (int64, error) {
	collection := client.Database("account_management").Collection("accounts_2")

	
	objID, err := primitive.ObjectIDFromHex(accountID)
	if err != nil {
		log.Println("Error converting account ID:", err)
		return 0, err
	}

	
	result, err := collection.DeleteOne(context.TODO(), bson.M{"_id": objID})
	if err != nil {
		log.Println("Error deleting account:", err)
		return 0, err
	}

	return result.DeletedCount, nil
}
