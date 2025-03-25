import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  useTheme, 
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider 
} from '@mui/material';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/dateFormat';
import { Entry } from '../store/api';

// Define the type for our heatmap data
interface CalendarData {
  date: string;
  count: number;
  entries: Entry[];
}

interface CalendarViewProps {
  entries: Entry[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ entries }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [calendarData, setCalendarData] = useState<CalendarData[]>([]);
  const [tooltipState, setTooltipState] = useState<{
    open: boolean;
    position: { top: number; left: number };
    content: string;
  }>({
    open: false,
    position: { top: 0, left: 0 },
    content: '',
  });
  
  // Add state for the entries dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<Entry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  // Get date range for the calendar (last 12 months)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 11);
  
  // Prepare data for the heatmap
  useEffect(() => {
    if (!entries || entries.length === 0) return;
    
    // Group entries by date
    const entriesByDate = entries.reduce<Record<string, Entry[]>>((acc, entry) => {
      // Extract just the date part (YYYY-MM-DD)
      const date = entry.createdAt.split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(entry);
      return acc;
    }, {});
    
    // Transform into the format needed by the heatmap
    const heatmapData = Object.keys(entriesByDate).map(date => ({
      date,
      count: entriesByDate[date].length,
      entries: entriesByDate[date]
    }));
    
    setCalendarData(heatmapData);
  }, [entries]);
  
  // Calculate color based on count
  const getColor = (count: number): string => {
    if (!count) return theme.palette.mode === 'dark' ? '#333' : '#eee';
    
    const colors = theme.palette.mode === 'dark' 
      ? ['#1e4470', '#1976d2', '#64b5f6', '#bbdefb'] 
      : ['#bbdefb', '#64b5f6', '#1976d2', '#1e4470'];
    
    if (count === 1) return colors[0];
    if (count === 2) return colors[1];
    if (count === 3) return colors[2];
    return colors[3]; // 4 or more
  };
  
  // Handle clicking on a date cell
  const handleDayClick = (value: CalendarData | null) => {
    if (!value || !value.entries || value.entries.length === 0) return;
    
    if (value.entries.length === 1) {
      // If only one entry, go directly to it
      navigate(`/entries/${value.entries[0].id}`);
    } else {
      // Show dialog with all entries for this date
      setSelectedEntries(value.entries);
      setSelectedDate(value.date);
      setDialogOpen(true);
    }
  };
  
  // Handle selecting an entry from the dialog
  const handleEntrySelect = (entryId: number) => {
    navigate(`/entries/${entryId}`);
    setDialogOpen(false);
  };
  
  // Handle mouse over event for tooltip
  const handleMouseOver = (event: React.MouseEvent, value: CalendarData | null) => {
    if (!value) {
      setTooltipState(prev => ({ ...prev, open: false }));
      return;
    }
    
    let content = 'No entries';
    
    if (value.count) {
      const formattedDate = formatDate(value.date);
      content = `${formattedDate}: ${value.count} ${value.count === 1 ? 'entry' : 'entries'}`;
    }

    // Calculate position based on mouse coordinates
    const position = {
      top: event.clientY - 40, // Position above cursor
      left: event.clientX,
    };
    
    setTooltipState({
      open: true,
      position,
      content
    });
  };
  
  // Handle mouse leave
  const handleMouseLeave = () => {
    setTooltipState(prev => ({
      ...prev,
      open: false
    }));
  };
  
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>Journal Activity Calendar</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Click on a day to view entries. Darker colors indicate more entries.
      </Typography>
      
      <Box sx={{ 
        '.react-calendar-heatmap': {
          width: '100%',
        },
        '.react-calendar-heatmap-tile': {
          rx: 2,
          ry: 2,
          cursor: 'pointer',
        },
        '.color-empty': {
          fill: theme.palette.mode === 'dark' ? '#333' : '#eee',
        },
        '.color-scale-1': { fill: getColor(1) },
        '.color-scale-2': { fill: getColor(2) },
        '.color-scale-3': { fill: getColor(3) },
        '.color-scale-4': { fill: getColor(4) }
      }}>
        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={calendarData}
          classForValue={(value) => {
            if (!value || !value.count) return 'color-empty';
            return `color-scale-${Math.min(value.count, 4)}`;
          }}
          onClick={handleDayClick}
          onMouseOver={(event, value) => handleMouseOver(event, value)}
          onMouseLeave={handleMouseLeave}
        />
        
        {/* Position-based tooltip */}
        {tooltipState.open && (
          <div 
            style={{
              position: 'fixed',
              top: `${tooltipState.position.top}px`,
              left: `${tooltipState.position.left}px`,
              transform: 'translate(-50%, -100%)',
              backgroundColor: theme.palette.mode === 'dark' ? '#444' : '#fff',
              color: theme.palette.text.primary,
              padding: '8px 16px',
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[1],
              fontSize: '0.875rem',
              zIndex: 1500,
              pointerEvents: 'none'
            }}
          >
            {tooltipState.content}
          </div>
        )}
      </Box>
      
      {/* Dialog to show all entries for a selected date */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Entries for {formatDate(selectedDate)}
        </DialogTitle>
        <DialogContent>
          <List>
            {selectedEntries.map((entry, index) => (
              <React.Fragment key={entry.id}>
                <ListItem button onClick={() => handleEntrySelect(entry.id)}>
                  <ListItemText 
                    primary={entry.title}
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {entry.wordCount} words • {entry.mood || 'No mood'}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {entry.content.substring(0, 150)}
                          {entry.content.length > 150 ? '...' : ''}
                        </Typography>
                      </>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
                {index < selectedEntries.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default CalendarView; 