import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGetEntryQuery, useDeleteEntryMutation } from '../store/api';
import type { Entry, Tag } from '../store/api';

const EntryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const entryId = id ? parseInt(id, 10) : 0;
  const { data: entry, isLoading } = useGetEntryQuery(entryId);
  const [deleteEntry] = useDeleteEntryMutation();

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  if (!entry) {
    return <Typography>Entry not found</Typography>;
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteEntry(entryId).unwrap();
        navigate('/');
      } catch (error) {
        console.error('Failed to delete entry:', error);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4" component="h1">
            {entry.title}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/entries/${entryId}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Stack>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="subtitle1" color="text.secondary">
            {new Date(entry.createdAt).toLocaleDateString()}
          </Typography>
          {entry.mood && (
            <Chip
              label={entry.mood}
              color="primary"
              size="small"
            />
          )}
        </Stack>
        <Box sx={{ mb: 2 }}>
          {entry.tags?.map((tag: Tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              sx={{ mr: 1, mb: 1 }}
              size="small"
            />
          ))}
        </Box>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {entry.content}
        </Typography>
      </Paper>
    </Box>
  );
};

export default EntryDetail; 