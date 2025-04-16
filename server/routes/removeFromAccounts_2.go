package routes

import (
	"account/server/db"
	"account/server/models"
	"account/server/validation"
	"encoding/json"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"net/http"
)

func RemoveFromAccounts_2(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		AccountID    string `json:"account_id"`  
		Code         string `json:"code"`
		Name         string `json:"name"`
		MainCurrency string `json:"currency"` 
		Mobile       string `json:"mobile"`
		Address      string `json:"address"`
	}

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	account := models.Account{
		// AccountID:    input.AccountID, 
		Code:         input.Code,
		Name:         input.Name,
		MainCurrency: input.MainCurrency,
		Mobile:       input.Mobile,
		Address:      input.Address,
	}

	if validationErrors := validation.ValidateAccountInput(account.Code, account.Name, account.Address, account.Mobile, account.MainCurrency); validationErrors != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status": "error",
			"errors": validationErrors,
		})
		return
	}
	isDuplicate, err := db.IsDuplicateCode(account.Code)
	if err != nil {
		http.Error(w, "Database error during uniqueness check", http.StatusInternalServerError)
		return
	}
	if isDuplicate {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  "error",
			"message": "Code already exists for another account",
		})
		return
	}
	result, err := db.AddAccount(account)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  "error",
			"message": "Failed to add account",
		})
		return
	}

	insertedID := ""
	if oid, ok := result.InsertedID.(primitive.ObjectID); ok {
		insertedID = oid.Hex()
	}

	deletedCount, err := db.DeleteAccount_2(input.AccountID)
	if err != nil || deletedCount == 0 {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  "error",
			"message": input.AccountID,
		})
		return
	}


	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"message": "Account added successfully",
		"id":      insertedID,
	}) 
}
