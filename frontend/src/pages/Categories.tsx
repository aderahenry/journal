import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Divider,
  Grid,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ColorLens as ColorLensIcon,
} from '@mui/icons-material';
import { TwitterPicker } from 'react-color';
import { useDispatch } from 'react-redux';
import { showNotification } from '../store/slices/notificationSlice';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '../store/api';
import type { Category } from '../store/api';

const DEFAULT_COLORS = [
  '#FF6900', '#FCB900', '#7BDCB5', '#00D084', '#8ED1FC', '#0693E3',
  '#ABB8C3', '#EB144C', '#F78DA7', '#9900EF'
];

const Categories: React.FC = () => {
  const dispatch = useDispatch();
  const { data: categories, isLoading } = useGetCategoriesQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({ name: '', color: '#0693E3' });
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('create');

  const handleOpenCreateDialog = () => {
    setCurrentCategory({ name: '', color: '#0693E3' });
    setMode('create');
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (category: Category) => {
    setCurrentCategory({ ...category });
    setMode('edit');
    setIsDialogOpen(true);
  };

  const handleOpenDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsColorPickerOpen(false);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  const handleChangeColor = (color: any) => {
    setCurrentCategory({ ...currentCategory, color: color.hex });
    setIsColorPickerOpen(false);
  };

  const handleSaveCategory = async () => {
    try {
      if (!currentCategory.name || !currentCategory.color) {
        dispatch(showNotification({
          message: 'Name and color are required',
          type: 'error',
        }));
        return;
      }

      if (mode === 'create') {
        await createCategory(currentCategory).unwrap();
        dispatch(showNotification({
          message: 'Category created successfully',
          type: 'success',
        }));
      } else {
        if (!currentCategory.id) return;
        
        await updateCategory({
          id: currentCategory.id,
          category: {
            name: currentCategory.name,
            color: currentCategory.color,
          }
        }).unwrap();
        
        dispatch(showNotification({
          message: 'Category updated successfully',
          type: 'success',
        }));
      }
      
      handleCloseDialog();
    } catch (error) {
      dispatch(showNotification({
        message: `Failed to ${mode === 'create' ? 'create' : 'update'} category`,
        type: 'error',
      }));
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      await deleteCategory(categoryToDelete.id).unwrap();
      dispatch(showNotification({
        message: 'Category deleted successfully',
        type: 'success',
      }));
      handleCloseDeleteDialog();
    } catch (error) {
      dispatch(showNotification({
        message: 'Failed to delete category',
        type: 'error',
      }));
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Categories</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Add Category
        </Button>
      </Box>

      {categories && categories.length > 0 ? (
        <Paper>
          <List>
            {categories.map((category: Category) => (
              <React.Fragment key={category.id}>
                <ListItem>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: category.color,
                      mr: 2,
                    }}
                  />
                  <ListItemText primary={category.name} />
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleOpenEditDialog(category)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleOpenDeleteDialog(category)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      ) : (
        <Alert severity="info">
          You haven't created any categories yet. Categories help you organize your journal entries.
        </Alert>
      )}

      {/* Category Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{mode === 'create' ? 'Create Category' : 'Edit Category'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Category Name"
                value={currentCategory.name}
                onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ mr: 2 }}>Color: </Typography>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: currentCategory.color,
                    border: '1px solid #ccc',
                    mr: 1,
                    cursor: 'pointer',
                  }}
                  onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                />
                <IconButton onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}>
                  <ColorLensIcon />
                </IconButton>
              </Box>
              {isColorPickerOpen && (
                <Box sx={{ mt: 2 }}>
                  <TwitterPicker
                    color={currentCategory.color}
                    onChangeComplete={handleChangeColor}
                    colors={DEFAULT_COLORS}
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveCategory} variant="contained">
            {mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the category <strong>{categoryToDelete?.name}</strong>?
          </Typography>
          <Typography color="error" sx={{ mt: 2 }}>
            This will remove the category from all journal entries that use it.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteCategory} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories; 