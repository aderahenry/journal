import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useCreateEntryMutation } from '../store/api';
import type { Tag } from '../store/api';

const MOODS = ['Happy', 'Sad', 'Angry', 'Excited', 'Peaceful', 'Neutral', 'Anxious', 'Grateful', 'Frustrated', 'Hopeful'];

const EntryCreate: React.FC = () => {
  const navigate = useNavigate();
  const [createEntry] = useCreateEntryMutation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEntry({
        title,
        content,
        mood,
        tags: tags.map(tag => tag.name),
      }).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Failed to create entry:', error);
    }
  };

  const handleAddTag = () => {
    if (newTag && !tags.some(tag => tag.name === newTag)) {
      setTags([...tags, { id: Date.now(), name: newTag }]);
      setNewTag('');
    }
  };

  const handleDeleteTag = (tagToDelete: Tag) => {
    setTags(tags.filter(tag => tag.id !== tagToDelete.id));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          New Entry
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Mood</InputLabel>
              <Select
                value={mood}
                label="Mood"
                onChange={(e) => setMood(e.target.value)}
              >
                {MOODS.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              multiline
              rows={10}
              fullWidth
            />
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Tags
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <TextField
                  label="New Tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  size="small"
                />
                <Button onClick={handleAddTag}>Add</Button>
              </Stack>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tag.name}
                    onDelete={() => handleDeleteTag(tag)}
                  />
                ))}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!title || !content}
              >
                Create Entry
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default EntryCreate; 