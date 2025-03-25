package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"journal/models"
	"journal/services"

	"github.com/gorilla/mux"
)

type CategoryHandler struct {
	categoryService *services.CategoryService
}

func NewCategoryHandler(categoryService *services.CategoryService) *CategoryHandler {
	return &CategoryHandler{
		categoryService: categoryService,
	}
}

// GetCategories retrieves all categories for the current user
func (h *CategoryHandler) GetCategories(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get current userID from context
	userID := r.Context().Value("userID").(uint)

	// Get categories from service
	categories, err := h.categoryService.GetCategories(userID)
	if err != nil {
		http.Error(w, "Failed to retrieve categories", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
}

// GetCategory retrieves a specific category by ID
func (h *CategoryHandler) GetCategory(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get current userID from context
	userID := r.Context().Value("userID").(uint)

	// Parse category ID from URL
	vars := mux.Vars(r)
	categoryID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid category ID", http.StatusBadRequest)
		return
	}

	// Get category from service
	category, err := h.categoryService.GetCategory(uint(categoryID), userID)
	if err != nil {
		http.Error(w, "Category not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(category)
}

// CreateCategory creates a new category for the current user
func (h *CategoryHandler) CreateCategory(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get current userID from context
	userID := r.Context().Value("userID").(uint)

	// Decode request body
	var categoryDTO models.CategoryDTO
	if err := json.NewDecoder(r.Body).Decode(&categoryDTO); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if categoryDTO.Name == "" {
		http.Error(w, "Category name is required", http.StatusBadRequest)
		return
	}

	// Use default color if not provided
	if categoryDTO.Color == "" {
		categoryDTO.Color = "#0693E3" // Default blue color
	}

	// Create category using service
	createdCategory, err := h.categoryService.CreateCategory(userID, categoryDTO)
	if err != nil {
		http.Error(w, "Failed to create category", http.StatusInternalServerError)
		return
	}

	// Return created category
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdCategory)
}

// UpdateCategory updates an existing category
func (h *CategoryHandler) UpdateCategory(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get current userID from context
	userID := r.Context().Value("userID").(uint)

	// Parse category ID from URL
	vars := mux.Vars(r)
	categoryID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid category ID", http.StatusBadRequest)
		return
	}

	// Decode request body
	var categoryDTO models.CategoryDTO
	if err := json.NewDecoder(r.Body).Decode(&categoryDTO); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if categoryDTO.Name == "" {
		http.Error(w, "Category name is required", http.StatusBadRequest)
		return
	}

	// Update category using service
	updatedCategory, err := h.categoryService.UpdateCategory(uint(categoryID), userID, categoryDTO)
	if err != nil {
		if err.Error() == "category not found" {
			http.Error(w, "Category not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to update category", http.StatusInternalServerError)
		}
		return
	}

	// Return updated category
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedCategory)
}

// DeleteCategory deletes a category
func (h *CategoryHandler) DeleteCategory(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get current userID from context
	userID := r.Context().Value("userID").(uint)

	// Parse category ID from URL
	vars := mux.Vars(r)
	categoryID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid category ID", http.StatusBadRequest)
		return
	}

	// Delete category using service
	if err := h.categoryService.DeleteCategory(uint(categoryID), userID); err != nil {
		if err.Error() == "category not found" {
			http.Error(w, "Category not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to delete category", http.StatusInternalServerError)
		}
		return
	}

	// Return success with no content
	w.WriteHeader(http.StatusNoContent)
}
