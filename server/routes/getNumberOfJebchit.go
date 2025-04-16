package routes

import (
	"account/server/db"
	"encoding/json"
	"net/http"
)

func GetNumberOfJebchit(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	count, err := db.CountAccountsByAddress("Jibchit")
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  "error",
			"message": "Error retrieving accounts",
		})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":   "success",
		"count": count,
	})
}
