package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

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
