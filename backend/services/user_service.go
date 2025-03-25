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

func (s *UserService) UpdateUserPreferences(userID uint, prefsData models.UserPreferences) (*models.UserPreferences, error) {
	// Get existing preferences
	var prefs models.UserPreferences
	result := s.db.Where("user_id = ?", userID).First(&prefs)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			// Create preferences if not found
			prefs = models.UserPreferences{
				UserID:             userID,
				Theme:              prefsData.Theme,
				DefaultView:        prefsData.DefaultView,
				DateFormat:         prefsData.DateFormat,
				EmailNotifications: prefsData.EmailNotifications,
			}
			if err := s.db.Create(&prefs).Error; err != nil {
				return nil, err
			}
		} else {
			return nil, result.Error
		}
	} else {
		// Update existing preferences
		prefs.Theme = prefsData.Theme
		prefs.DefaultView = prefsData.DefaultView
		prefs.DateFormat = prefsData.DateFormat
		prefs.EmailNotifications = prefsData.EmailNotifications

		if err := s.db.Save(&prefs).Error; err != nil {
			return nil, err
		}
	}

	return &prefs, nil
}

func (s *UserService) GetUserPreferences(userID uint) (*models.UserPreferences, error) {
	var prefs models.UserPreferences
	if err := s.db.Where("user_id = ?", userID).First(&prefs).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Create default preferences if none exist
			prefs = models.UserPreferences{
				UserID:             userID,
				Theme:              "light",
				DefaultView:        "list",
				DateFormat:         "MM/DD/YYYY",
				EmailNotifications: false,
			}
			if err := s.db.Create(&prefs).Error; err != nil {
				return nil, err
			}
			return &prefs, nil
		}
		return nil, err
	}
	return &prefs, nil
}
