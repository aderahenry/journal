package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"journal/models"
	"journal/services"
)

type UserPreferencesRequest struct {
	Theme              string `json:"theme"`
	DefaultView        string `json:"defaultView"`
	DateFormat         string `json:"dateFormat"`
	EmailNotifications bool   `json:"emailNotifications"`
}

type UserHandler struct {
	userService *services.UserService
}

func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

// GetUserPreferences retrieves the preferences for the current user
func (h *UserHandler) GetUserPreferences(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get user ID from context
	userID := r.Context().Value("userID").(uint)

	// Get preferences from service
	prefs, err := h.userService.GetUserPreferences(userID)
	if err != nil {
		http.Error(w, "Failed to retrieve user preferences", http.StatusInternalServerError)
		return
	}

	// Convert to response format
	response := models.UserPreferencesDTO{
		Theme:              prefs.Theme,
		DefaultView:        prefs.DefaultView,
		DateFormat:         prefs.DateFormat,
		EmailNotifications: prefs.EmailNotifications,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// UpdateUserPreferences updates the preferences for the current user
func (h *UserHandler) UpdateUserPreferences(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get user ID from context
	userID := r.Context().Value("userID").(uint)

	// Parse request body
	var req UserPreferencesRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Update preferences in service
	prefs := models.UserPreferences{
		Theme:              req.Theme,
		DefaultView:        req.DefaultView,
		DateFormat:         req.DateFormat,
		EmailNotifications: req.EmailNotifications,
	}

	updatedPrefs, err := h.userService.UpdateUserPreferences(userID, prefs)
	if err != nil {
		http.Error(w, "Failed to update user preferences", http.StatusInternalServerError)
		return
	}

	// Convert to response format
	response := models.UserPreferencesDTO{
		Theme:              updatedPrefs.Theme,
		DefaultView:        updatedPrefs.DefaultView,
		DateFormat:         updatedPrefs.DateFormat,
		EmailNotifications: updatedPrefs.EmailNotifications,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// DebugUserPreferences is a debug endpoint to check raw user preferences
func (h *UserHandler) DebugUserPreferences(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get user ID from context
	userID := r.Context().Value("userID").(uint)

	// Get preferences using the service
	prefs, err := h.userService.GetUserPreferences(userID)
	if err != nil {
		// Create a response with detailed error information
		errorResponse := struct {
			Error       string `json:"error"`
			UserID      uint   `json:"userId"`
			ErrorDetail string `json:"errorDetail"`
		}{
			Error:       "Error retrieving preferences",
			UserID:      userID,
			ErrorDetail: err.Error(),
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(errorResponse)
		return
	}

	// Create a response with detailed preference information
	debugResponse := struct {
		UserID             uint      `json:"userId"`
		ID                 uint      `json:"id"`
		Theme              string    `json:"theme"`
		DefaultView        string    `json:"defaultView"`
		EmailNotifications bool      `json:"emailNotifications"`
		CreatedAt          time.Time `json:"createdAt"`
		UpdatedAt          time.Time `json:"updatedAt"`
	}{
		UserID:             prefs.UserID,
		ID:                 prefs.ID,
		Theme:              prefs.Theme,
		DefaultView:        prefs.DefaultView,
		EmailNotifications: prefs.EmailNotifications,
		CreatedAt:          prefs.CreatedAt,
		UpdatedAt:          prefs.UpdatedAt,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(debugResponse)
}
