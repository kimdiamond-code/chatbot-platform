// Operating Hours Service - Handles time zone awareness and operating hours logic
export class OperatingHoursService {
  constructor() {
    this.defaultTimezone = 'UTC';
  }

  // Check if current time is within operating hours
  isWithinOperatingHours(operatingHours, userTimezone = null) {
    if (!operatingHours || !operatingHours.enabled) {
      return true; // Always open if operating hours are disabled
    }

    try {
      const now = new Date();
      const timezone = userTimezone || operatingHours.timezone || this.defaultTimezone;
      
      // Get current time in the specified timezone
      const currentTime = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }).format(now);

      const [currentHour, currentMinute] = currentTime.split(':').map(Number);
      const currentTimeMinutes = currentHour * 60 + currentMinute;

      // Parse operating hours
      const [startHour, startMinute] = operatingHours.start.split(':').map(Number);
      const [endHour, endMinute] = operatingHours.end.split(':').map(Number);
      
      const startTimeMinutes = startHour * 60 + startMinute;
      const endTimeMinutes = endHour * 60 + endMinute;

      // Handle same day hours (e.g., 9:00 AM - 5:00 PM)
      if (startTimeMinutes < endTimeMinutes) {
        return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes;
      }
      
      // Handle overnight hours (e.g., 10:00 PM - 6:00 AM next day)
      return currentTimeMinutes >= startTimeMinutes || currentTimeMinutes <= endTimeMinutes;
      
    } catch (error) {
      console.error('Error checking operating hours:', error);
      // Default to open if there's an error
      return true;
    }
  }

  // Generate offline message
  generateOfflineMessage(operatingHours, botName = 'ChatBot') {
    if (!operatingHours || !operatingHours.enabled) {
      return null;
    }

    const timezone = operatingHours.timezone || this.defaultTimezone;
    const startTime = this.formatTime(operatingHours.start);
    const endTime = this.formatTime(operatingHours.end);

    const messages = [
      `Hi! I'm ${botName}. I'm currently offline, but I'll be back during our operating hours.`,
      `Our support hours are ${startTime} to ${endTime} (${this.formatTimezone(timezone)}).`,
      `Feel free to leave a message and a human agent will get back to you, or try again during our operating hours!`
    ];

    return {
      message: messages.join(' '),
      operatingHours: {
        start: startTime,
        end: endTime,
        timezone: this.formatTimezone(timezone),
        enabled: true
      }
    };
  }

  // Format time for display (convert 24h to 12h format)
  formatTime(time24h) {
    try {
      const [hours, minutes] = time24h.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return time24h; // Return original if parsing fails
    }
  }

  // Format timezone for display
  formatTimezone(timezone) {
    try {
      // Common timezone abbreviations
      const timezoneMap = {
        'America/New_York': 'EST/EDT',
        'America/Chicago': 'CST/CDT',
        'America/Denver': 'MST/MDT',
        'America/Los_Angeles': 'PST/PDT',
        'Europe/London': 'GMT/BST',
        'Europe/Paris': 'CET/CEST',
        'Asia/Tokyo': 'JST',
        'Asia/Shanghai': 'CST',
        'UTC': 'UTC'
      };

      return timezoneMap[timezone] || timezone;
    } catch (error) {
      return timezone;
    }
  }

  // Get user's timezone (client-side only)
  getUserTimezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      return this.defaultTimezone;
    }
  }

  // Calculate next opening time
  getNextOpeningTime(operatingHours) {
    if (!operatingHours || !operatingHours.enabled) {
      return null;
    }

    try {
      const now = new Date();
      const timezone = operatingHours.timezone || this.defaultTimezone;
      
      // Calculate next opening based on current time and operating hours
      const [startHour, startMinute] = operatingHours.start.split(':').map(Number);
      
      const nextOpening = new Date(now);
      nextOpening.setHours(startHour, startMinute, 0, 0);
      
      // If today's opening time has passed, move to tomorrow
      if (nextOpening <= now) {
        nextOpening.setDate(nextOpening.getDate() + 1);
      }

      return {
        datetime: nextOpening.toISOString(),
        formatted: nextOpening.toLocaleString('en-US', {
          timeZone: timezone,
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        timeUntil: this.getTimeUntil(nextOpening)
      };
    } catch (error) {
      console.error('Error calculating next opening time:', error);
      return null;
    }
  }

  // Calculate human-readable time until next opening
  getTimeUntil(targetTime) {
    const now = new Date();
    const diff = targetTime - now;
    
    if (diff <= 0) return 'now';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `in ${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `in ${hours}h ${minutes}m`;
    } else {
      return `in ${minutes}m`;
    }
  }

  // Validate operating hours configuration
  validateOperatingHours(operatingHours) {
    if (!operatingHours || typeof operatingHours !== 'object') {
      return { valid: false, error: 'Operating hours configuration is missing' };
    }

    if (operatingHours.enabled) {
      if (!operatingHours.start || !operatingHours.end) {
        return { valid: false, error: 'Start and end times are required when operating hours are enabled' };
      }

      // Validate time format
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(operatingHours.start) || !timeRegex.test(operatingHours.end)) {
        return { valid: false, error: 'Invalid time format. Use HH:MM (24-hour format)' };
      }

      // Validate timezone
      if (operatingHours.timezone) {
        try {
          Intl.DateTimeFormat('en-US', { timeZone: operatingHours.timezone });
        } catch (error) {
          return { valid: false, error: 'Invalid timezone' };
        }
      }
    }

    return { valid: true };
  }
}

// Export singleton instance
export const operatingHoursService = new OperatingHoursService();
export default operatingHoursService;
