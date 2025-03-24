package services

import (
	"errors"
	"strings"

	"journal/models"

	"gorm.io/gorm"
)

type JournalService struct {
	db *gorm.DB
}

func NewJournalService(db *gorm.DB) *JournalService {
	return &JournalService{db: db}
}

func (s *JournalService) CreateEntry(userID uint, title, content string, categoryID *uint, mood string, tagNames []string) (*models.JournalEntryDTO, error) {
	// Calculate word count
	wordCount := uint(len(strings.Fields(content)))

	// Create entry
	entry := models.JournalEntry{
		UserID:     userID,
		CategoryID: categoryID,
		Title:      title,
		Content:    content,
		Mood:       mood,
		WordCount:  wordCount,
	}

	if err := s.db.Create(&entry).Error; err != nil {
		return nil, err
	}

	// Handle tags
	if len(tagNames) > 0 {
		var tags []models.Tag
		for _, tagName := range tagNames {
			var tag models.Tag
			// Try to find existing tag
			err := s.db.Where("user_id = ? AND name = ?", userID, tagName).First(&tag).Error
			if err == nil {
				tags = append(tags, tag)
			} else {
				// Create new tag
				tag = models.Tag{
					UserID: userID,
					Name:   tagName,
				}
				if err := s.db.Create(&tag).Error; err != nil {
					return nil, err
				}
				tags = append(tags, tag)
			}
		}
		entry.Tags = tags
	}

	return s.convertToDTO(&entry), nil
}

func (s *JournalService) GetEntry(id uint, userID uint) (*models.JournalEntryDTO, error) {
	var entry models.JournalEntry
	if err := s.db.Preload("Tags").First(&entry, id).Error; err != nil {
		return nil, err
	}

	if entry.UserID != userID {
		return nil, errors.New("unauthorized")
	}

	return s.convertToDTO(&entry), nil
}

func (s *JournalService) UpdateEntry(id uint, userID uint, title, content string, categoryID *uint, mood string, tagNames []string) (*models.JournalEntryDTO, error) {
	var entry models.JournalEntry
	if err := s.db.First(&entry, id).Error; err != nil {
		return nil, err
	}

	if entry.UserID != userID {
		return nil, errors.New("unauthorized")
	}

	// Update fields
	entry.Title = title
	entry.Content = content
	entry.CategoryID = categoryID
	entry.Mood = mood
	entry.WordCount = uint(len(strings.Fields(content)))

	// Handle tags
	if len(tagNames) > 0 {
		var tags []models.Tag
		for _, tagName := range tagNames {
			var tag models.Tag
			err := s.db.Where("user_id = ? AND name = ?", userID, tagName).First(&tag).Error
			if err == nil {
				tags = append(tags, tag)
			} else {
				tag = models.Tag{
					UserID: userID,
					Name:   tagName,
				}
				if err := s.db.Create(&tag).Error; err != nil {
					return nil, err
				}
				tags = append(tags, tag)
			}
		}
		entry.Tags = tags
	}

	if err := s.db.Save(&entry).Error; err != nil {
		return nil, err
	}

	return s.convertToDTO(&entry), nil
}

func (s *JournalService) DeleteEntry(id uint, userID uint) error {
	var entry models.JournalEntry
	if err := s.db.First(&entry, id).Error; err != nil {
		return err
	}

	if entry.UserID != userID {
		return errors.New("unauthorized")
	}

	return s.db.Delete(&entry).Error
}

func (s *JournalService) ListEntries(userID uint, categoryID *uint, tagID *uint, page, pageSize int) ([]models.JournalEntryDTO, int64, error) {
	var entries []models.JournalEntry
	var total int64

	query := s.db.Model(&models.JournalEntry{}).Where("user_id = ?", userID)

	if categoryID != nil {
		query = query.Where("category_id = ?", *categoryID)
	}

	if tagID != nil {
		query = query.Joins("JOIN journal_entry_tags ON journal_entries.id = journal_entry_tags.entry_id").
			Where("journal_entry_tags.tag_id = ?", *tagID)
	}

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	if err := query.Preload("Tags").
		Order("created_at DESC").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&entries).Error; err != nil {
		return nil, 0, err
	}

	// Convert to DTOs
	var dtos []models.JournalEntryDTO
	for _, entry := range entries {
		dtos = append(dtos, *s.convertToDTO(&entry))
	}

	return dtos, total, nil
}

func (s *JournalService) GetEntryStats(userID uint) (map[string]interface{}, error) {
	var stats struct {
		TotalEntries     int64
		TotalWords       int64
		AvgWordsPerEntry float64
		CategoryCount    int64
		TagCount         int64
		MoodDistribution []struct {
			Mood  string
			Count int64
		}
		CategoryDistribution []struct {
			Category string
			Count    int64
		}
	}

	// Get total entries and words
	if err := s.db.Model(&models.JournalEntry{}).
		Where("user_id = ?", userID).
		Count(&stats.TotalEntries).Error; err != nil {
		return nil, err
	}

	if err := s.db.Model(&models.JournalEntry{}).
		Where("user_id = ?", userID).
		Select("COALESCE(SUM(word_count), 0)").
		Scan(&stats.TotalWords).Error; err != nil {
		return nil, err
	}

	if stats.TotalEntries > 0 {
		stats.AvgWordsPerEntry = float64(stats.TotalWords) / float64(stats.TotalEntries)
	}

	// Get category and tag counts
	if err := s.db.Model(&models.Category{}).
		Where("user_id = ?", userID).
		Count(&stats.CategoryCount).Error; err != nil {
		return nil, err
	}

	if err := s.db.Model(&models.Tag{}).
		Where("user_id = ?", userID).
		Count(&stats.TagCount).Error; err != nil {
		return nil, err
	}

	// Get mood distribution
	if err := s.db.Model(&models.JournalEntry{}).
		Where("user_id = ?", userID).
		Select("mood, COUNT(*) as count").
		Group("mood").
		Scan(&stats.MoodDistribution).Error; err != nil {
		return nil, err
	}

	// Get category distribution with LEFT JOIN to include entries without categories
	if err := s.db.Model(&models.JournalEntry{}).
		Where("journal_entries.user_id = ?", userID).
		Joins("LEFT JOIN categories ON journal_entries.category_id = categories.id").
		Select("COALESCE(categories.name, 'Uncategorized') as category, COUNT(*) as count").
		Group("categories.name").
		Scan(&stats.CategoryDistribution).Error; err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"totalEntries":         stats.TotalEntries,
		"totalWords":           stats.TotalWords,
		"avgWordsPerEntry":     stats.AvgWordsPerEntry,
		"categoryCount":        stats.CategoryCount,
		"tagCount":             stats.TagCount,
		"moodDistribution":     stats.MoodDistribution,
		"categoryDistribution": stats.CategoryDistribution,
	}, nil
}

func (s *JournalService) convertToDTO(entry *models.JournalEntry) *models.JournalEntryDTO {
	var tagDTOs []models.TagDTO
	for _, tag := range entry.Tags {
		tagDTOs = append(tagDTOs, models.TagDTO{
			ID:   tag.ID,
			Name: tag.Name,
		})
	}

	return &models.JournalEntryDTO{
		ID:         entry.ID,
		Title:      entry.Title,
		Content:    entry.Content,
		CategoryID: entry.CategoryID,
		Mood:       entry.Mood,
		WordCount:  entry.WordCount,
		Tags:       tagDTOs,
		CreatedAt:  entry.CreatedAt,
		UpdatedAt:  entry.UpdatedAt,
	}
}
