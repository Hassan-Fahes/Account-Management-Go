package db

import (
	"account/server/models"
	"context"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func GetAllAccounts() ([]models.Account, error) {
	collection := client.Database("account_management").Collection("accounts")
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

func AddAccount(account models.Account) (*mongo.InsertOneResult, error) {
	collection := client.Database("account_management").Collection("accounts")

	result, err := collection.InsertOne(context.TODO(), account)
	if err != nil {
		return nil, err
	}

	return result, nil
}



func DeleteAccountFromDB(accountID string) (int64, error) {
	collection := client.Database("account_management").Collection("accounts")

	
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

func UpdateAccount(account models.Account, accountID string) (*mongo.UpdateResult, error) {
	collection := client.Database("account_management").Collection("accounts")
	objID, err := primitive.ObjectIDFromHex(accountID)
	if err != nil {
		log.Println("Error converting account ID:", err)
		return nil, err
	}

	filter := bson.M{"_id": objID}

	update := bson.M{
		"$set": bson.M{
			"code" :         account.Code,
			"name":          account.Name,
			"main_currency": account.MainCurrency,
			"mobile":        account.Mobile,
			"address":       account.Address,
		},
	}

	updateResult, err := collection.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		log.Println("Error during database update:", err)
		return nil, err
	}

	log.Println("Update result:", updateResult) 
	return updateResult, nil
}