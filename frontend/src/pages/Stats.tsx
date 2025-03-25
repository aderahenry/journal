import React from 'react';
import { useGetEntryStatsQuery } from '../store/api';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Description as DescriptionIcon,
  TextFields as TextFieldsIcon,
  BarChart as BarChartIcon,
  LocalOffer as LocalOfferIcon,
} from '@mui/icons-material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Render custom label for pie chart
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
    >
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

const Stats: React.FC = () => {
  const { data: stats, isLoading, error } = useGetEntryStatsQuery();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          There was a problem loading your journal statistics. Please try again later.
        </Alert>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box p={3}>
        <Alert severity="info">
          Start creating journal entries to see your statistics.
        </Alert>
      </Box>
    );
  }

  // Transform the data for the charts with fallback to empty arrays if data is missing
  const moodData = stats.moodDistribution && stats.moodDistribution.length > 0
    ? stats.moodDistribution.map(item => ({
        name: item.Mood,
        value: item.Count
      }))
    : [{ name: 'No Data', value: 1 }];

  const categoryData = stats.categoryDistribution && stats.categoryDistribution.length > 0
    ? stats.categoryDistribution.map(item => ({
        name: item.Category || 'Uncategorized',
        value: item.Count
      }))
    : [{ name: 'No Data', value: 1 }];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
  }> = ({ title, value, icon }) => (
    <Card>
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

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Overview Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Entries"
            value={stats.totalEntries}
            icon={<DescriptionIcon fontSize="large" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Words"
            value={stats.totalWords}
            icon={<TextFieldsIcon fontSize="large" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg. Words/Entry"
            value={stats.avgWordsPerEntry.toFixed(1)}
            icon={<BarChartIcon fontSize="large" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tags"
            value={stats.tagCount}
            icon={<LocalOfferIcon fontSize="large" />}
          />
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Mood Distribution
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {moodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} entries`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Category Distribution
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} entries`, 'Count']} />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Entries" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Stats; 