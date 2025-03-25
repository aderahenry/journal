import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationState {
  open: boolean;
  message: string;
  type: NotificationType;
  duration?: number;
}

const initialState: NotificationState = {
  open: false,
  message: '',
  type: 'info',
  duration: 4000,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification: (
      state,
      action: PayloadAction<{
        message: string;
        type?: NotificationType;
        duration?: number;
      }>
    ) => {
      state.open = true;
      state.message = action.payload.message;
      state.type = action.payload.type || 'info';
      state.duration = action.payload.duration || 4000;
    },
    hideNotification: (state) => {
      state.open = false;
    },
  },
});

export const { showNotification, hideNotification } = notificationSlice.actions;
export default notificationSlice.reducer; 