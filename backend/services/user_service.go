package services

import (
	"errors"

	"journal/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserService struct {
	db *gorm.DB
}

func NewUserService(db *gorm.DB) *UserService {
	return &UserService{db: db}
}

func (s *UserService) CreateUser(email, password, firstName, lastName string) (*models.UserDTO, error) {
	// Check if user already exists
	var existingUser models.User
	if err := s.db.Where("email = ?", email).First(&existingUser).Error; err == nil {
		return nil, errors.New("user already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Create user
	user := models.User{
		Email:        email,
		PasswordHash: string(hashedPassword),
		FirstName:    firstName,
		LastName:     lastName,
	}

	if err := s.db.Create(&user).Error; err != nil {
		return nil, err
	}

	// Create default preferences
	preferences := models.UserPreferences{
		UserID: user.ID,
	}
	if err := s.db.Create(&preferences).Error; err != nil {
		return nil, err
	}

	return &models.UserDTO{
		ID:        user.ID,
		Email:     user.Email,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}, nil
}

func (s *UserService) AuthenticateUser(email, password string) (*models.User, error) {
	var user models.User
	if err := s.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	return &user, nil
}

func (s *UserService) GetUserByID(id uint) (*models.UserDTO, error) {
	var user models.User
	if err := s.db.First(&user, id).Error; err != nil {
		return nil, err
	}

	return &models.UserDTO{
		ID:        user.ID,
		Email:     user.Email,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}, nil
}

func (s *UserService) UpdateUser(id uint, firstName, lastName string) (*models.UserDTO, error) {
	var user models.User
	if err := s.db.First(&user, id).Error; err != nil {
		return nil, err
	}

	user.FirstName = firstName
	user.LastName = lastName

	if err := s.db.Save(&user).Error; err != nil {
		return nil, err
	}

	return &models.UserDTO{
		ID:        user.ID,
		Email:     user.Email,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}, nil
}

func (s *UserService) UpdateUserPreferences(id uint, theme, defaultView string, emailNotifications bool) error {
	return s.db.Model(&models.UserPreferences{}).Where("user_id = ?", id).Updates(map[string]interface{}{
		"theme":               theme,
		"default_view":        defaultView,
		"email_notifications": emailNotifications,
	}).Error
}

func (s *UserService) GetUserPreferences(id uint) (*models.UserPreferences, error) {
	var preferences models.UserPreferences
	if err := s.db.Where("user_id = ?", id).First(&preferences).Error; err != nil {
		return nil, err
	}
	return &preferences, nil
}
