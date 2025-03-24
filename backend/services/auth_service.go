package services

import (
	"errors"
	"os"
	"time"

	"journal/models"

	"github.com/golang-jwt/jwt/v5"
)

type AuthService struct {
	userService *UserService
}

func NewAuthService(userService *UserService) *AuthService {
	return &AuthService{
		userService: userService,
	}
}

type Claims struct {
	UserID uint   `json:"userId"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

func (s *AuthService) GenerateToken(user *models.User) (string, error) {
	claims := Claims{
		UserID: user.ID,
		Email:  user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

func (s *AuthService) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

func (s *AuthService) Login(email, password string) (string, error) {
	user, err := s.userService.AuthenticateUser(email, password)
	if err != nil {
		return "", err
	}

	return s.GenerateToken(user)
}

func (s *AuthService) Register(email, password, firstName, lastName string) (string, error) {
	_, err := s.userService.CreateUser(email, password, firstName, lastName)
	if err != nil {
		return "", err
	}

	// Get the full user model for token generation
	fullUser, err := s.userService.AuthenticateUser(email, password)
	if err != nil {
		return "", err
	}

	return s.GenerateToken(fullUser)
}
