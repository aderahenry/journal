import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  Slider,
  Stack,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import { 
  DarkMode as DarkModeIcon, 
  Notifications as NotificationsIcon,
  ViewList as ViewListIcon,
  DateRange as DateRangeIcon,
  LocalOffer as TagIcon,
  Save as SaveIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import { RootState } from '../store/store';
import { 
  toggleDarkMode, 
  setNotifications, 
  setDefaultView, 
  setDateFormat,
  setTagsToShow,
  fetchPreferences,
  savePreferences
} from '../store/slices/preferencesSlice';
import { showNotification } from '../store/slices/notificationSlice';

const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const preferences = useSelector((state: RootState) => state.preferences);

  // Fetch preferences from backend when component mounts
  useEffect(() => {
    // Fetch from backend with direct fetch for more reliable operation
    fetch('http://localhost:3000/api/user/preferences', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch preferences');
        }
        return response.json();
      })
      .then(data => {
        // Update preferences in Redux store
        if (data.theme) {
          const isDarkMode = data.theme === 'dark';
          // Only update if different from current state
          if (isDarkMode !== preferences.darkMode) {
            dispatch(toggleDarkMode());
          }
        }
        
        if (data.defaultView) {
          dispatch(setDefaultView(data.defaultView));
        }
        
        if (data.dateFormat) {
          dispatch(setDateFormat(data.dateFormat));
        }
        
        if (data.emailNotifications !== undefined) {
          dispatch(setNotifications(data.emailNotifications));
        }
      })
      .catch(error => {
        console.error('Error fetching preferences:', error);
      });
  }, [dispatch]);

  const handleSave = () => {
    // Save preferences to both localStorage and backend
    const backendPrefs = {
      theme: preferences.darkMode ? 'dark' : 'light',
      defaultView: preferences.defaultView,
      dateFormat: preferences.dateFormat,
      emailNotifications: preferences.notificationsEnabled
    };

    // Save to backend with direct fetch for more reliable operation
    fetch('http://localhost:3000/api/user/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(backendPrefs)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to save preferences');
        }
        return response.json();
      })
      .then(() => {
        dispatch(showNotification({
          message: 'Your preferences have been saved!',
          type: 'success',
          duration: 3000
        }));
      })
      .catch(error => {
        dispatch(showNotification({
          message: error.message || 'Failed to save preferences',
          type: 'error',
          duration: 5000
        }));
      });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Settings
          </Typography>
          {preferences.isSyncing && (
            <CircularProgress size={24} />
          )}
        </Box>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Customize your journal app experience by updating your preferences below.
        </Typography>

        {preferences.error && (
          <Typography color="error" sx={{ my: 2 }}>
            {preferences.error}
          </Typography>
        )}

        <Divider sx={{ my: 3 }} />

        <Stack spacing={4}>
          {/* Appearance Settings */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <DarkModeIcon sx={{ mr: 1 }} /> Appearance
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.darkMode}
                  onChange={() => dispatch(toggleDarkMode())}
                />
              }
              label="Dark Mode"
            />
          </Box>

          {/* Notifications Settings */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <NotificationsIcon sx={{ mr: 1 }} /> Notifications
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.notificationsEnabled}
                  onChange={(e) => dispatch(setNotifications(e.target.checked))}
                />
              }
              label="Enable Notifications"
            />
          </Box>

          {/* Display Settings */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <ViewListIcon sx={{ mr: 1 }} /> Display
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="default-view-label">Default View</InputLabel>
              <Select
                labelId="default-view-label"
                value={preferences.defaultView}
                label="Default View"
                onChange={(e) => dispatch(setDefaultView(e.target.value as 'list' | 'calendar'))}
              >
                <MenuItem value="list">List</MenuItem>
                <MenuItem value="calendar">Calendar</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Date Format Settings */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <DateRangeIcon sx={{ mr: 1 }} /> Date Format
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="date-format-label">Date Format</InputLabel>
              <Select
                labelId="date-format-label"
                value={preferences.dateFormat}
                label="Date Format"
                onChange={(e) => 
                  dispatch(setDateFormat(e.target.value as 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'))
                }
              >
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Tags Settings */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <TagIcon sx={{ mr: 1 }} /> Tags
            </Typography>
            <Box sx={{ px: 2 }}>
              <Typography id="tags-slider" gutterBottom>
                Number of tags to show: {preferences.tagsToShow}
              </Typography>
              <Slider
                value={preferences.tagsToShow}
                onChange={(_, value) => dispatch(setTagsToShow(value as number))}
                aria-labelledby="tags-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={10}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={preferences.isSyncing}
            >
              Save Preferences
            </Button>
            <Button
              variant="outlined"
              startIcon={<SyncIcon />}
              onClick={() => dispatch(fetchPreferences())}
              disabled={preferences.isSyncing}
            >
              Sync with Server
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Settings; 