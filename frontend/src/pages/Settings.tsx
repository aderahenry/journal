import React from 'react';
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
  Alert,
  Snackbar,
} from '@mui/material';
import { 
  DarkMode as DarkModeIcon, 
  Notifications as NotificationsIcon,
  ViewList as ViewListIcon,
  DateRange as DateRangeIcon,
  LocalOffer as TagIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { RootState } from '../store/store';
import { 
  toggleDarkMode, 
  setNotifications, 
  setDefaultView, 
  setDateFormat,
  setTagsToShow
} from '../store/slices/preferencesSlice';

const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const preferences = useSelector((state: RootState) => state.preferences);
  const [showSaveAlert, setShowSaveAlert] = React.useState(false);

  const handleSave = () => {
    setShowSaveAlert(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Customize your journal app experience by updating your preferences below.
        </Typography>

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

          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            Save Preferences
          </Button>
        </Stack>
      </Paper>

      <Snackbar
        open={showSaveAlert}
        autoHideDuration={3000}
        onClose={() => setShowSaveAlert(false)}
      >
        <Alert onClose={() => setShowSaveAlert(false)} severity="success">
          Your preferences have been saved!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 