import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
} from '@mui/material';
import {
  Description as DescriptionIcon,
  TextFields as TextFieldsIcon,
  BarChart as BarChartIcon,
  LocalOffer as LocalOfferIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useGetEntriesQuery, useGetEntryStatsQuery } from '../store/api';
import type { Entry } from '../store/api';

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

const Dashboard: React.FC = () => {
  const { data: entriesData, isLoading: isLoadingEntries } = useGetEntriesQuery();
  const { data: stats, isLoading: isLoadingStats } = useGetEntryStatsQuery();

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

        {/* Recent Entries */}
        <Grid item xs={12}>
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
              {entriesData?.entries.slice(0, 5).map((entry: Entry) => (
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
                            {new Date(entry.createdAt).toLocaleDateString()}
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 