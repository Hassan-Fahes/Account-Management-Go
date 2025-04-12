package routes

import (
	"account/server/db"
	"account/server/models"
	"account/server/validation"
	"encoding/json"
	"net/http"
	"log"
)

func UpdateAccount(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		Code         string `json:"code"`
		Name         string `json:"name"`
		MainCurrency string `json:"main_currency"`
		Mobile       string `json:"mobile"`
		Address      string `json:"address"`
		AccountID    string `json:"account_id"`
	}

	
	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}	
	account := models.Account{
		Code:         input.Code,
		Name:         input.Name,
		MainCurrency: input.MainCurrency,
		Mobile:       input.Mobile,
		Address:      input.Address,
	}
	
	

	if validationErrors := validation.ValidateAccountInput(account.Code, account.Name, account.Address, account.Mobile, account.MainCurrency); validationErrors != nil {
		w.WriteHeader(http.StatusBadRequest)
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

	updateResult, err := db.UpdateAccount(account, input.AccountID)  
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		log.Println("Error updating account:", err)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  "error",
			"message": "Failed to update account. " + err.Error(),
		})
		return
	}
	

	log.Println("Modified count:", updateResult.ModifiedCount)
	

	if updateResult.ModifiedCount > 0 {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  "success",
			"message": "Account updated successfully",
		})
	} else {
		
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  "error",
			"message": "No changes were made to the account. Please check the provided data.",
		})
	}
}
