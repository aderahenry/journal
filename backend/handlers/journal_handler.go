package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"journal/models"
	"journal/services"

	"github.com/gorilla/mux"
)

type JournalHandler struct {
	journalService *services.JournalService
}

func NewJournalHandler(journalService *services.JournalService) *JournalHandler {
	return &JournalHandler{
		journalService: journalService,
	}
}

type CreateEntryRequest struct {
	Title      string   `json:"title"`
	Content    string   `json:"content"`
	CategoryID *uint    `json:"categoryId"`
	Mood       string   `json:"mood"`
	Tags       []string `json:"tags"`
}

type UpdateEntryRequest struct {
	Title      string   `json:"title"`
	Content    string   `json:"content"`
	CategoryID *uint    `json:"categoryId"`
	Mood       string   `json:"mood"`
	Tags       []string `json:"tags"`
}

func (h *JournalHandler) CreateEntry(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := r.Context().Value("userID").(uint)

	var req CreateEntryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	entry, err := h.journalService.CreateEntry(
		userID,
		req.Title,
		req.Content,
		req.CategoryID,
		req.Mood,
		req.Tags,
	)
	if err != nil {
		http.Error(w, "Failed to create entry", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entry)
}

func (h *JournalHandler) GetEntry(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := r.Context().Value("userID").(uint)
	vars := mux.Vars(r)
	entryID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid entry ID", http.StatusBadRequest)
		return
	}

	entry, err := h.journalService.GetEntry(uint(entryID), userID)
	if err != nil {
		http.Error(w, "Entry not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entry)
}

func (h *JournalHandler) UpdateEntry(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := r.Context().Value("userID").(uint)
	vars := mux.Vars(r)
	entryID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid entry ID", http.StatusBadRequest)
		return
	}

	var req UpdateEntryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	entry, err := h.journalService.UpdateEntry(
		uint(entryID),
		userID,
		req.Title,
		req.Content,
		req.CategoryID,
		req.Mood,
		req.Tags,
	)
	if err != nil {
		http.Error(w, "Failed to update entry", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entry)
}

func (h *JournalHandler) DeleteEntry(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := r.Context().Value("userID").(uint)
	vars := mux.Vars(r)
	entryID, err := strconv.ParseUint(vars["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid entry ID", http.StatusBadRequest)
		return
	}

	if err := h.journalService.DeleteEntry(uint(entryID), userID); err != nil {
		http.Error(w, "Failed to delete entry", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *JournalHandler) ListEntries(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := r.Context().Value("userID").(uint)

	// Parse query parameters
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}

	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
	if pageSize < 1 {
		pageSize = 10
	}

	var categoryID *uint
	if catID := r.URL.Query().Get("categoryId"); catID != "" {
		if id, err := strconv.ParseUint(catID, 10, 32); err == nil {
			uid := uint(id)
			categoryID = &uid
		}
	}

	var tagID *uint
	if tID := r.URL.Query().Get("tagId"); tID != "" {
		if id, err := strconv.ParseUint(tID, 10, 32); err == nil {
			uid := uint(id)
			tagID = &uid
		}
	}

	entries, total, err := h.journalService.ListEntries(userID, categoryID, tagID, page, pageSize)
	if err != nil {
		http.Error(w, "Failed to list entries", http.StatusInternalServerError)
		return
	}

	response := struct {
		Entries []models.JournalEntryDTO `json:"entries"`
		Total   int64                    `json:"total"`
	}{
		Entries: entries,
		Total:   total,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *JournalHandler) GetEntryStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := r.Context().Value("userID").(uint)

	stats, err := h.journalService.GetEntryStats(userID)
	if err != nil {
		http.Error(w, "Failed to get entry stats", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}
