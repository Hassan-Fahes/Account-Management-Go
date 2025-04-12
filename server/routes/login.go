package routes

import (
	"encoding/json"
	"net/http"
	"account/server/db"
	"account/server/validation"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// Object of LoginResponse 
type LoginResponse struct {
	Status  string            `json:"status"`
	Errors  map[string]string `json:"errors,omitempty"`
	Message interface{}       `json:"message,omitempty"`  // تغيير النوع إلى interface{} لإمكانية إرسال بيانات متعددة
	Token   string            `json:"token,omitempty"`
}
// LoginHandler هو معالج تسجيل الدخول
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	
	// Validation
	if validationErrors := validation.ValidateLogin(req.Username, req.Password); validationErrors != nil {
		response := LoginResponse{
			Status: "error",
			Errors: validationErrors,
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	user, err := db.GetUserByUsername(req.Username)
	if err != nil {
		response := LoginResponse{
			Status:  "success",
			Message: "Incorrect username or password",
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		response := LoginResponse{
			Status:  "success",
			Message: "Incorrect username or password",
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	token, err := generateJWT(user.Username)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}


	response := LoginResponse{
		Status: "success",
		Message: map[string]interface{}{
			"username": user.Username,
			"id":       user.ID,
		},
		Token: token,
	}
	json.NewEncoder(w).Encode(response)
}
