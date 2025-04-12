package db

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
)

func IsDuplicateCode(code string) (bool, error) {
	collection := client.Database("account_management").Collection("accounts")

	filter := bson.M{"code": code}

	count, err := collection.CountDocuments(context.TODO(), filter)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}
