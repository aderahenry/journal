import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGetEntryQuery, useDeleteEntryMutation } from '../store/api';
import { showNotification } from '../store/slices/notificationSlice';
import type { Entry, Tag } from '../store/api';
import { formatDate } from '../utils/dateFormat';

const EntryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const entryId = id ? parseInt(id, 10) : 0;
  const { data: entry, isLoading } = useGetEntryQuery(entryId);
  const [deleteEntry] = useDeleteEntryMutation();
  
  // State for confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  if (!entry) {
    return <Typography>Entry not found</Typography>;
  }

  const handleDeleteRequest = () => {
    setConfirmDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteEntry(entryId).unwrap();
      setConfirmDialogOpen(false);
      
      dispatch(showNotification({
        message: 'Entry deleted successfully',
        type: 'success'
      }));
      
      navigate('/');
    } catch (error) {
      console.error('Failed to delete entry:', error);
      setConfirmDialogOpen(false);
      
      dispatch(showNotification({
        message: 'Failed to delete entry. Please try again.',
        type: 'error'
      }));
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDialogOpen(false);
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
              onClick={handleDeleteRequest}
            >
              Delete
            </Button>
          </Stack>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="subtitle1" color="text.secondary">
            {formatDate(entry.createdAt, true)}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this entry? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EntryDetail; 