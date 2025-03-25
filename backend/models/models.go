package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Email        string `gorm:"uniqueIndex:idx_email,length:255;not null"`
	PasswordHash string `gorm:"not null"`
	FirstName    string
	LastName     string
	Preferences  UserPreferences
	Categories   []Category
	Entries      []JournalEntry
	Tags         []Tag
}

type UserPreferences struct {
	gorm.Model
	UserID             uint   `gorm:"uniqueIndex"`
	Theme              string `gorm:"default:'light'"`
	DefaultView        string `gorm:"default:'list'"`
	DateFormat         string `gorm:"default:'MM/DD/YYYY'"`
	EmailNotifications bool   `gorm:"default:false"`
}

type Category struct {
	gorm.Model
	UserID  uint   `gorm:"not null"`
	Name    string `gorm:"not null;index:idx_category_name,length:100"`
	Color   string `gorm:"default:'#000000'"`
	User    User   `gorm:"foreignKey:UserID"`
	Entries []JournalEntry
}

type JournalEntry struct {
	gorm.Model
	UserID     uint `gorm:"not null"`
	CategoryID *uint
	Title      string `gorm:"not null;index:idx_entry_title,length:255"`
	Content    string `gorm:"type:text;not null"`
	Mood       string `gorm:"index:idx_entry_mood,length:50"`
	WordCount  uint
	User       User      `gorm:"foreignKey:UserID"`
	Category   *Category `gorm:"foreignKey:CategoryID"`
	Tags       []Tag     `gorm:"many2many:journal_entry_tags;joinForeignKey:entry_id;joinReferences:tag_id"`
}

type Tag struct {
	gorm.Model
	UserID  uint           `gorm:"not null"`
	Name    string         `gorm:"not null;index:idx_tag_name,length:100"`
	User    User           `gorm:"foreignKey:UserID"`
	Entries []JournalEntry `gorm:"many2many:journal_entry_tags;"`
}

type JournalEntryTag struct {
	EntryID uint         `gorm:"column:entry_id;primaryKey"`
	TagID   uint         `gorm:"column:tag_id;primaryKey"`
	Entry   JournalEntry `gorm:"foreignKey:EntryID"`
	Tag     Tag          `gorm:"foreignKey:TagID"`
}

// DTOs (Data Transfer Objects)
type UserDTO struct {
	ID        uint      `json:"id"`
	Email     string    `json:"email"`
	FirstName string    `json:"firstName"`
	LastName  string    `json:"lastName"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type UserPreferencesDTO struct {
	Theme              string `json:"theme"`
	DefaultView        string `json:"defaultView"`
	DateFormat         string `json:"dateFormat"`
	EmailNotifications bool   `json:"emailNotifications"`
}

type JournalEntryDTO struct {
	ID         uint      `json:"id"`
	Title      string    `json:"title"`
	Content    string    `json:"content"`
	CategoryID *uint     `json:"categoryId"`
	Mood       string    `json:"mood"`
	WordCount  uint      `json:"wordCount"`
	Tags       []TagDTO  `json:"tags"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type TagDTO struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

type CategoryDTO struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Color string `json:"color"`
}
