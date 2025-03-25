import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the preferences state type
export interface PreferencesState {
  darkMode: boolean;
  notificationsEnabled: boolean;
  defaultView: 'list' | 'calendar';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  tagsToShow: number;
}

// Load preferences from localStorage if available
const loadPreferences = (): PreferencesState => {
  const savedPreferences = localStorage.getItem('preferences');
  if (savedPreferences) {
    try {
      return JSON.parse(savedPreferences);
    } catch (error) {
      console.error('Failed to parse saved preferences:', error);
    }
  }

  // Default preferences
  return {
    darkMode: false,
    notificationsEnabled: true,
    defaultView: 'list',
    dateFormat: 'MM/DD/YYYY',
    tagsToShow: 5,
  };
};

// Initial state
const initialState: PreferencesState = loadPreferences();

// Create the preferences slice
const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('preferences', JSON.stringify(state));
    },
    setNotifications: (state, action: PayloadAction<boolean>) => {
      state.notificationsEnabled = action.payload;
      localStorage.setItem('preferences', JSON.stringify(state));
    },
    setDefaultView: (state, action: PayloadAction<'list' | 'calendar'>) => {
      state.defaultView = action.payload;
      localStorage.setItem('preferences', JSON.stringify(state));
    },
    setDateFormat: (
      state,
      action: PayloadAction<'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'>
    ) => {
      state.dateFormat = action.payload;
      localStorage.setItem('preferences', JSON.stringify(state));
    },
    setTagsToShow: (state, action: PayloadAction<number>) => {
      state.tagsToShow = action.payload;
      localStorage.setItem('preferences', JSON.stringify(state));
    },
  },
});

// Export actions and reducer
export const {
  toggleDarkMode,
  setNotifications,
  setDefaultView,
  setDateFormat,
  setTagsToShow,
} = preferencesSlice.actions;

export default preferencesSlice.reducer; 