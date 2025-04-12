package db

import (
	"context"
	"errors"
	"account/server/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// GetUserByUsername 
func GetUserByUsername(username string) (*models.User, error) {
	collection := client.Database("account_management").Collection("users")
	var user models.User
	err := collection.FindOne(context.Background(), bson.M{"username": username}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return &user, nil
}
