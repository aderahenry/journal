import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { api, UserPreferencesDTO } from '../api';

// Define the preferences state type
export interface PreferencesState {
  darkMode: boolean;
  notificationsEnabled: boolean;
  defaultView: 'list' | 'calendar';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  tagsToShow: number;
  isSyncing: boolean;
  error: string | null;
}

// Load preferences from localStorage if available
const loadPreferences = (): PreferencesState => {
  const savedPreferences = localStorage.getItem('preferences');
  if (savedPreferences) {
    try {
      const parsed = JSON.parse(savedPreferences);
      return {
        ...parsed,
        isSyncing: false,
        error: null
      };
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
    isSyncing: false,
    error: null
  };
};

// Create async thunk for fetching preferences
export const fetchPreferences = createAsyncThunk(
  'preferences/fetch',
  async (_, { rejectWithValue }) => {
    try {
      // Directly use the API without initiate
      const response = await fetch('http://localhost:3000/api/user/preferences', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }
      
      const data = await response.json();
      return {
        darkMode: data.theme === 'dark',
        defaultView: data.defaultView as 'list' | 'calendar',
        notificationsEnabled: data.emailNotifications
      };
    } catch (error) {
      return rejectWithValue('Failed to fetch preferences');
    }
  }
);

// Create async thunk for saving preferences
export const savePreferences = createAsyncThunk(
  'preferences/save',
  async (preferences: Partial<PreferencesState>, { rejectWithValue }) => {
    try {
      // Convert from frontend preferences format to backend format
      const backendPrefs: Partial<UserPreferencesDTO> = {
        theme: preferences.darkMode ? 'dark' : 'light',
        defaultView: preferences.defaultView,
        emailNotifications: preferences.notificationsEnabled
      };
      
      // Directly use the API without initiate
      const response = await fetch('http://localhost:3000/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(backendPrefs)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }
      
      return preferences;
    } catch (error) {
      return rejectWithValue('Failed to save preferences');
    }
  }
);

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchPreferences.pending, (state) => {
        state.isSyncing = true;
        state.error = null;
      })
      .addCase(fetchPreferences.fulfilled, (state, action) => {
        state.isSyncing = false;
        // Only update the values that are managed on the backend
        if (action.payload.darkMode !== undefined) {
          state.darkMode = action.payload.darkMode;
        }
        if (action.payload.defaultView !== undefined) {
          state.defaultView = action.payload.defaultView;
        }
        if (action.payload.notificationsEnabled !== undefined) {
          state.notificationsEnabled = action.payload.notificationsEnabled;
        }
        localStorage.setItem('preferences', JSON.stringify(state));
      })
      .addCase(fetchPreferences.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.payload as string;
      })
      .addCase(savePreferences.pending, (state) => {
        state.isSyncing = true;
        state.error = null;
      })
      .addCase(savePreferences.fulfilled, (state) => {
        state.isSyncing = false;
      })
      .addCase(savePreferences.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.payload as string;
      });
  }
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