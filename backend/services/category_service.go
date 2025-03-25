package services

import (
	"errors"
	"journal/models"

	"gorm.io/gorm"
)

type CategoryService struct {
	db *gorm.DB
}

func NewCategoryService(db *gorm.DB) *CategoryService {
	return &CategoryService{
		db: db,
	}
}

// GetCategories retrieves all categories for a specific user
func (s *CategoryService) GetCategories(userID uint) ([]models.CategoryDTO, error) {
	var categories []models.Category
	if err := s.db.Where("user_id = ?", userID).Find(&categories).Error; err != nil {
		return nil, err
	}

	// Map to DTOs
	var categoryDTOs []models.CategoryDTO
	for _, category := range categories {
		categoryDTOs = append(categoryDTOs, models.CategoryDTO{
			ID:    category.ID,
			Name:  category.Name,
			Color: category.Color,
		})
	}

	return categoryDTOs, nil
}

// GetCategory retrieves a specific category by ID for a user
func (s *CategoryService) GetCategory(categoryID, userID uint) (*models.CategoryDTO, error) {
	var category models.Category
	if err := s.db.Where("id = ? AND user_id = ?", categoryID, userID).First(&category).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("category not found")
		}
		return nil, err
	}

	return &models.CategoryDTO{
		ID:    category.ID,
		Name:  category.Name,
		Color: category.Color,
	}, nil
}
