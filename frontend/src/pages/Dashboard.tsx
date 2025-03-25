import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Card,
  CardContent,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  TextFields as TextFieldsIcon,
  BarChart as BarChartIcon,
  LocalOffer as LocalOfferIcon,
  Add as AddIcon,
  Edit as EditIcon,
  ViewList as ViewListIcon,
  CalendarViewMonth as CalendarIcon,
} from '@mui/icons-material';
import { useGetEntriesQuery, useGetEntryStatsQuery } from '../store/api';
import type { Entry } from '../store/api';
import { formatDate } from '../utils/dateFormat';
import { RootState } from '../store/store';
import CalendarView from '../components/CalendarView';
import { useDispatch } from 'react-redux';
import { setDefaultView } from '../store/slices/preferencesSlice';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
}> = ({ title, value, icon }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box color="primary.main">{icon}</Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h6">{value}</Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

// Component for the list view of entries
const EntriesListView: React.FC<{ entries: Entry[] }> = ({ entries }) => (
  <Paper sx={{ height: '100%' }}>
    <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="h6">Recent Entries</Typography>
      <Button
        component={RouterLink}
        to="/entries/new"
        variant="contained"
        startIcon={<AddIcon />}
      >
        New Entry
      </Button>
    </Box>
    <Divider />
    <List>
      {entries.slice(0, 5).map((entry: Entry) => (
        <React.Fragment key={entry.id}>
          <ListItem>
            <ListItemText
              primary={
                <Typography
                  component={RouterLink}
                  to={`/entries/${entry.id}`}
                  sx={{ color: 'primary.main', textDecoration: 'none' }}
                >
                  {entry.title}
                </Typography>
              }
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(entry.createdAt)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    •
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {entry.wordCount} words
                  </Typography>
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <Button
                component={RouterLink}
                to={`/entries/${entry.id}/edit`}
                startIcon={<EditIcon />}
              >
                Edit
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  </Paper>
);

const Dashboard: React.FC = () => {
  const { data: entriesData, isLoading: isLoadingEntries } = useGetEntriesQuery();
  const { data: stats, isLoading: isLoadingStats } = useGetEntryStatsQuery();
  const preferences = useSelector((state: RootState) => state.preferences);
  const dispatch = useDispatch();
  
  // Local state for view to allow immediate switching without waiting for Redux
  const [currentView, setCurrentView] = useState<'list' | 'calendar'>(preferences.defaultView);

  // Handle view toggle
  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: 'list' | 'calendar' | null
  ) => {
    if (newView !== null) {
      setCurrentView(newView);
      dispatch(setDefaultView(newView));
    }
  };

  if (isLoadingEntries || isLoadingStats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Stats Overview */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Entries"
            value={stats?.totalEntries || 0}
            icon={<DescriptionIcon fontSize="large" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Words"
            value={stats?.totalWords || 0}
            icon={<TextFieldsIcon fontSize="large" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg. Words/Entry"
            value={stats?.avgWordsPerEntry.toFixed(1) || 0}
            icon={<BarChartIcon fontSize="large" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tags"
            value={stats?.tagCount || 0}
            icon={<LocalOfferIcon fontSize="large" />}
          />
        </Grid>

        {/* View Toggle */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <ToggleButtonGroup
              value={currentView}
              exclusive
              onChange={handleViewChange}
              aria-label="view mode"
              size="small"
            >
              <ToggleButton value="list" aria-label="list view">
                <ViewListIcon sx={{ mr: 1 }} /> List
              </ToggleButton>
              <ToggleButton value="calendar" aria-label="calendar view">
                <CalendarIcon sx={{ mr: 1 }} /> Calendar
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Grid>

        {/* Entries Display - Conditional Rendering */}
        <Grid item xs={12}>
          {currentView === 'list' ? (
            <EntriesListView entries={entriesData?.entries || []} />
          ) : (
            <CalendarView entries={entriesData?.entries || []} />
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 