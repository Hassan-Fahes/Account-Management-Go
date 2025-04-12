package routes

import (
	"github.com/golang-jwt/jwt/v4"
	"time"
)

// jwtSecret مفتاح التوقيع لتوليد التوكن
var jwtSecret = []byte("fhdsfhdsjkweuhsfjf9weruwyhgfksdhfkhdskjfhmnvsnofhwhffbmnsbfdsf")

// Claims هي بنية تحتوي على بيانات التوكن
type Claims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// توليد التوكن
func generateJWT(username string) (string, error) {
	claims := Claims{
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "Account Management",
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}
	return signedToken, nil
}
