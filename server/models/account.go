package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Account struct {
	ID           primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Code         string                `json:"code" bson:"code"`
	Name         string             `json:"name" bson:"name"`
	MainCurrency string             `json:"main_currency" bson:"main_currency"`
	Mobile       string             `json:"mobile" bson:"mobile"`
	Address      string             `json:"address" bson:"address"`
	AccountID    string 			`json:"account_id"` 
}
