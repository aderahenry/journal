import { format, parseISO } from 'date-fns';
import { store } from '../store/store';

/**
 * Formats a date string according to the user's preference
 * @param dateString ISO date string to format
 * @param includeTime Whether to include the time in the formatted date
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, includeTime: boolean = false): string => {
  try {
    const { preferences } = store.getState();
    const date = parseISO(dateString);
    
    // Map the preference format to date-fns format
    let formatString: string;
    switch (preferences.dateFormat) {
      case 'MM/DD/YYYY':
        formatString = 'MM/dd/yyyy';
        break;
      case 'DD/MM/YYYY':
        formatString = 'dd/MM/yyyy';
        break;
      case 'YYYY-MM-DD':
        formatString = 'yyyy-MM-dd';
        break;
      default:
        formatString = 'MM/dd/yyyy';
    }
    
    // Add time if requested
    if (includeTime) {
      formatString += ' h:mm a';
    }
    
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return the original string if there's an error
  }
};

/**
 * Hook to use the current date format in a component
 * @returns The current date format
 */
export const useDateFormat = (): string => {
  const { preferences } = store.getState();
  return preferences.dateFormat;
}; 