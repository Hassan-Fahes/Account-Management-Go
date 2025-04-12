package routes

import (
    "encoding/json"
    "net/http"
    "strings"
	"account/server/db"
    "github.com/golang-jwt/jwt/v4"
)

func IsLoginHandler(w http.ResponseWriter, r *http.Request) {
    authHeader := r.Header.Get("Authorization")
    if authHeader == "" {
        http.Error(w, `{"status": "error", "message": "Authorization header missing"}`, http.StatusUnauthorized)
        return
    }

    tokenString := strings.Split(authHeader, "Bearer ")[1]

    claims := &Claims{}
    token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, http.ErrAbortHandler
        }
        return jwtSecret, nil
    })

    if err != nil || !token.Valid {
        http.Error(w, `{"status": "error", "message": "Invalid token"}`, http.StatusUnauthorized)
        return
    }

    user, err := db.GetUserByUsername(claims.Username)
    if err != nil {
        http.Error(w, `{"status": "error", "message": "User not found"}`, http.StatusNotFound)
        return
    }

    response := map[string]interface{}{
        "status": "success",
        "user": map[string]interface{}{
            "id":       user.ID,
            "username": user.Username,
        },
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}
