package routes

import (
	"account/server/db"
	"encoding/json"
	"net/http"
)

func DeleteAccount(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")


	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}


	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		AccountID string `json:"account_id"`
	}


	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil || input.AccountID == "" {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}


	deletedCount, err := db.DeleteAccountFromDB(input.AccountID)
	if err != nil || deletedCount == 0 {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  "error",
			"message": "Failed to delete account",
		})
		return
	}


	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"message": "Account deleted successfully",
	})
}
