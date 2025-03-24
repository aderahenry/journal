import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Fab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useGetEntriesQuery } from '../store/api';
import type { Entry } from '../store/api';

const EntryList: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetEntriesQuery();

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {data?.entries.map((entry: Entry) => (
          <Grid item xs={12} sm={6} md={4} key={entry.id}>
            <Card
              sx={{ height: '100%', cursor: 'pointer' }}
              onClick={() => navigate(`/entries/${entry.id}`)}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {entry.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {entry.content.substring(0, 150)}
                  {entry.content.length > 150 ? '...' : ''}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/entries/new')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default EntryList; 