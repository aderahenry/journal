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

// CreateCategory creates a new category for a user
func (s *CategoryService) CreateCategory(userID uint, categoryDTO models.CategoryDTO) (*models.CategoryDTO, error) {
	// Create the category model from DTO
	category := models.Category{
		UserID: userID,
		Name:   categoryDTO.Name,
		Color:  categoryDTO.Color,
	}

	// Save to database
	if err := s.db.Create(&category).Error; err != nil {
		return nil, err
	}

	// Return the created category as DTO
	return &models.CategoryDTO{
		ID:    category.ID,
		Name:  category.Name,
		Color: category.Color,
	}, nil
}

// UpdateCategory updates an existing category
func (s *CategoryService) UpdateCategory(categoryID, userID uint, categoryDTO models.CategoryDTO) (*models.CategoryDTO, error) {
	// Find the category first to ensure it exists and belongs to the user
	var category models.Category
	if err := s.db.Where("id = ? AND user_id = ?", categoryID, userID).First(&category).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("category not found")
		}
		return nil, err
	}

	// Update the category fields
	category.Name = categoryDTO.Name
	category.Color = categoryDTO.Color

	// Save changes
	if err := s.db.Save(&category).Error; err != nil {
		return nil, err
	}

	// Return the updated category as DTO
	return &models.CategoryDTO{
		ID:    category.ID,
		Name:  category.Name,
		Color: category.Color,
	}, nil
}

// DeleteCategory deletes a category and updates related entries
func (s *CategoryService) DeleteCategory(categoryID, userID uint) error {
	// Begin a transaction
	tx := s.db.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	// Verify the category exists and belongs to the user
	var category models.Category
	if err := tx.Where("id = ? AND user_id = ?", categoryID, userID).First(&category).Error; err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("category not found")
		}
		return err
	}

	// Set categoryId to NULL for all entries that use this category
	if err := tx.Model(&models.JournalEntry{}).Where("category_id = ?", categoryID).Update("category_id", nil).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Delete the category
	if err := tx.Delete(&category).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Commit the transaction
	return tx.Commit().Error
}
