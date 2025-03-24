package db

import (
	"fmt"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func InitDB() (*gorm.DB, error) {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %v", err)
	}

	// Auto-migrate schemas with proper order to handle foreign key constraints
	// if err := db.AutoMigrate(
	// 	&models.User{},
	// 	&models.UserPreferences{},
	// 	&models.Category{},
	// 	&models.Tag{},
	// 	&models.JournalEntry{},
	// 	&models.JournalEntryTag{},
	// ); err != nil {
	// 	return nil, fmt.Errorf("failed to migrate database: %v", err)
	// }

	return db, nil
}
