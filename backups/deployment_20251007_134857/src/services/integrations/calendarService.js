// Calendar Integration Service - Google Calendar & Calendly
class CalendarService {
  constructor() {
    this.googleConfig = this.loadConfig('google_calendar');
    this.calendlyConfig = this.loadConfig('calendly');
    this.initializeConfigs();
  }

  loadConfig(platform) {
    const saved = localStorage.getItem(`${platform}_config`);
    return saved ? JSON.parse(saved) : null;
  }

  initializeConfigs() {
    // Initialize Google Calendar
    if (this.googleConfig && this.googleConfig.status === 'connected') {
      this.googleHeaders = {
        'Authorization': `Bearer ${this.googleConfig.accessToken}`,
        'Content-Type': 'application/json'
      };
    }

    // Initialize Calendly
    if (this.calendlyConfig && this.calendlyConfig.status === 'connected') {
      this.calendlyHeaders = {
        'Authorization': `Bearer ${this.calendlyConfig.accessToken}`,
        'Content-Type': 'application/json'
      };
    }
  }

  isGoogleConnected() {
    return this.googleConfig && this.googleConfig.status === 'connected' && this.googleConfig.accessToken;
  }

  isCalendlyConnected() {
    return this.calendlyConfig && this.calendlyConfig.status === 'connected' && this.calendlyConfig.accessToken;
  }

  // ========== GOOGLE CALENDAR METHODS ==========

  async testGoogleConnection() {
    if (!this.isGoogleConnected()) {
      throw new Error('Google Calendar integration not configured');
    }

    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/settings', {
        method: 'GET',
        headers: this.googleHeaders
      });

      if (!response.ok) {
        throw new Error(`Google Calendar connection failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        settings: data,
        message: 'Connected to Google Calendar successfully'
      };
    } catch (error) {
      console.error('Google Calendar connection test failed:', error);
      throw error;
    }
  }

  async getGoogleCalendars() {
    if (!this.isGoogleConnected()) {
      throw new Error('Google Calendar integration not configured');
    }

    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        method: 'GET',
        headers: this.googleHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Google calendars: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching Google calendars:', error);
      throw error;
    }
  }

  async getGoogleEvents(calendarId = 'primary', timeMin = null, timeMax = null, maxResults = 10) {
    if (!this.isGoogleConnected()) {
      throw new Error('Google Calendar integration not configured');
    }

    try {
      let url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;
      const params = new URLSearchParams({
        orderBy: 'startTime',
        singleEvents: 'true',
        maxResults: maxResults.toString()
      });

      if (timeMin) {
        params.append('timeMin', timeMin);
      }
      if (timeMax) {
        params.append('timeMax', timeMax);
      }

      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: this.googleHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Google events: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching Google events:', error);
      throw error;
    }
  }

  async createGoogleEvent(calendarId = 'primary', eventData) {
    if (!this.isGoogleConnected()) {
      throw new Error('Google Calendar integration not configured');
    }

    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
        method: 'POST',
        headers: this.googleHeaders,
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to create Google event: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating Google event:', error);
      throw error;
    }
  }

  async findAvailableSlots(calendarId = 'primary', startDate, endDate, durationMinutes = 30) {
    if (!this.isGoogleConnected()) {
      throw new Error('Google Calendar integration not configured');
    }

    try {
      // Get busy times using freebusy API
      const freeBusyResponse = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
        method: 'POST',
        headers: this.googleHeaders,
        body: JSON.stringify({
          timeMin: startDate,
          timeMax: endDate,
          items: [{ id: calendarId }]
        })
      });

      if (!freeBusyResponse.ok) {
        throw new Error(`Failed to fetch free/busy data: ${freeBusyResponse.status}`);
      }

      const freeBusyData = await freeBusyResponse.json();
      const busyTimes = freeBusyData.calendars[calendarId]?.busy || [];

      // Generate available slots
      const availableSlots = this.generateAvailableSlots(
        new Date(startDate),
        new Date(endDate),
        busyTimes,
        durationMinutes
      );

      return availableSlots;
    } catch (error) {
      console.error('Error finding available slots:', error);
      throw error;
    }
  }

  // ========== CALENDLY METHODS ==========

  async testCalendlyConnection() {
    if (!this.isCalendlyConnected()) {
      throw new Error('Calendly integration not configured');
    }

    try {
      const response = await fetch('https://api.calendly.com/users/me', {
        method: 'GET',
        headers: this.calendlyHeaders
      });

      if (!response.ok) {
        throw new Error(`Calendly connection failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        user: data.resource,
        message: `Connected to Calendly as ${data.resource.name}`
      };
    } catch (error) {
      console.error('Calendly connection test failed:', error);
      throw error;
    }
  }

  async getCalendlyUser() {
    if (!this.isCalendlyConnected()) {
      throw new Error('Calendly integration not configured');
    }

    try {
      const response = await fetch('https://api.calendly.com/users/me', {
        method: 'GET',
        headers: this.calendlyHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Calendly user: ${response.status}`);
      }

      const data = await response.json();
      return data.resource;
    } catch (error) {
      console.error('Error fetching Calendly user:', error);
      throw error;
    }
  }

  async getCalendlyEventTypes(userUri) {
    if (!this.isCalendlyConnected()) {
      throw new Error('Calendly integration not configured');
    }

    try {
      const params = new URLSearchParams({
        user: userUri,
        active: 'true'
      });

      const response = await fetch(`https://api.calendly.com/event_types?${params}`, {
        method: 'GET',
        headers: this.calendlyHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Calendly event types: ${response.status}`);
      }

      const data = await response.json();
      return data.collection || [];
    } catch (error) {
      console.error('Error fetching Calendly event types:', error);
      throw error;
    }
  }

  async getCalendlyScheduledEvents(userUri, startTime = null, endTime = null, status = 'active') {
    if (!this.isCalendlyConnected()) {
      throw new Error('Calendly integration not configured');
    }

    try {
      const params = new URLSearchParams({
        user: userUri,
        status: status
      });

      if (startTime) {
        params.append('min_start_time', startTime);
      }
      if (endTime) {
        params.append('max_start_time', endTime);
      }

      const response = await fetch(`https://api.calendly.com/scheduled_events?${params}`, {
        method: 'GET',
        headers: this.calendlyHeaders
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Calendly events: ${response.status}`);
      }

      const data = await response.json();
      return data.collection || [];
    } catch (error) {
      console.error('Error fetching Calendly scheduled events:', error);
      throw error;
    }
  }

  async createCalendlyInvitee(scheduledEventUri, inviteeData) {
    if (!this.isCalendlyConnected()) {
      throw new Error('Calendly integration not configured');
    }

    try {
      const response = await fetch('https://api.calendly.com/scheduled_events/{uuid}/invitees', {
        method: 'POST',
        headers: this.calendlyHeaders,
        body: JSON.stringify(inviteeData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to create Calendly invitee: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.resource;
    } catch (error) {
      console.error('Error creating Calendly invitee:', error);
      throw error;
    }
  }

  // ========== UNIFIED METHODS ==========

  async getUpcomingMeetings(days = 7) {
    const results = {
      google: [],
      calendly: [],
      combined: [],
      success: false
    };

    const startTime = new Date();
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + days);

    // Get Google Calendar events
    if (this.isGoogleConnected()) {
      try {
        const googleEvents = await this.getGoogleEvents(
          'primary',
          startTime.toISOString(),
          endTime.toISOString(),
          20
        );
        results.google = this.formatGoogleEvents(googleEvents);
        results.success = true;
      } catch (error) {
        console.error('Error fetching Google Calendar events:', error);
      }
    }

    // Get Calendly events
    if (this.isCalendlyConnected()) {
      try {
        const user = await this.getCalendlyUser();
        const calendlyEvents = await this.getCalendlyScheduledEvents(
          user.uri,
          startTime.toISOString(),
          endTime.toISOString()
        );
        results.calendly = this.formatCalendlyEvents(calendlyEvents);
        results.success = true;
      } catch (error) {
        console.error('Error fetching Calendly events:', error);
      }
    }

    // Combine and sort events
    results.combined = [...results.google, ...results.calendly]
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    return results;
  }

  async scheduleAppointment(appointmentData) {
    const { platform, ...data } = appointmentData;

    if (platform === 'google' && this.isGoogleConnected()) {
      const eventData = this.formatGoogleEventData(data);
      return await this.createGoogleEvent('primary', eventData);
    }

    if (platform === 'calendly' && this.isCalendlyConnected()) {
      // Note: Calendly doesn't allow creating events via API, only managing existing bookings
      // This would typically redirect to a Calendly booking page
      return {
        booking_url: this.generateCalendlyBookingUrl(data),
        message: 'Please use the booking URL to schedule your appointment'
      };
    }

    throw new Error('No available calendar platform for scheduling');
  }

  async handleCalendarInquiry(message, customerEmail) {
    const inquiry = message.toLowerCase();
    
    try {
      // Meeting scheduling requests
      if (inquiry.includes('schedule') || inquiry.includes('book') || inquiry.includes('appointment') || inquiry.includes('meeting')) {
        const upcomingMeetings = await this.getUpcomingMeetings(14);
        
        if (upcomingMeetings.success) {
          return {
            type: 'schedule_request',
            data: upcomingMeetings,
            response: this.formatSchedulingResponse(upcomingMeetings.combined)
          };
        }
      }

      // Availability inquiries
      if (inquiry.includes('available') || inquiry.includes('free') || inquiry.includes('when can')) {
        try {
          const today = new Date();
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          
          const availableSlots = this.isGoogleConnected() 
            ? await this.findAvailableSlots('primary', today.toISOString(), nextWeek.toISOString(), 30)
            : [];
          
          return {
            type: 'availability_check',
            data: availableSlots,
            response: this.formatAvailabilityResponse(availableSlots)
          };
        } catch (error) {
          return {
            type: 'availability_error',
            response: 'I\'m having trouble checking availability right now. Please try scheduling directly or contact support.'
          };
        }
      }

      // Existing meetings inquiry
      if (inquiry.includes('meeting') && (inquiry.includes('today') || inquiry.includes('next') || inquiry.includes('upcoming'))) {
        const upcomingMeetings = await this.getUpcomingMeetings(7);
        
        return {
          type: 'upcoming_meetings',
          data: upcomingMeetings.combined,
          response: this.formatUpcomingMeetingsResponse(upcomingMeetings.combined)
        };
      }

    } catch (error) {
      console.error('Error handling calendar inquiry:', error);
      return {
        type: 'calendar_error',
        response: 'I\'m having trouble accessing calendar information right now. Please try again later or contact support.'
      };
    }

    return null;
  }

  // Helper Methods
  generateAvailableSlots(startDate, endDate, busyTimes, durationMinutes) {
    const slots = [];
    const current = new Date(startDate);
    
    // Business hours: 9 AM to 5 PM, Monday to Friday
    while (current < endDate) {
      if (current.getDay() >= 1 && current.getDay() <= 5) { // Monday to Friday
        const dayStart = new Date(current);
        dayStart.setHours(9, 0, 0, 0);
        const dayEnd = new Date(current);
        dayEnd.setHours(17, 0, 0, 0);
        
        let slotStart = new Date(dayStart);
        
        while (slotStart.getTime() + (durationMinutes * 60000) <= dayEnd.getTime()) {
          const slotEnd = new Date(slotStart.getTime() + (durationMinutes * 60000));
          
          // Check if slot conflicts with busy times
          const isAvailable = !busyTimes.some(busy => {
            const busyStart = new Date(busy.start);
            const busyEnd = new Date(busy.end);
            return slotStart < busyEnd && slotEnd > busyStart;
          });
          
          if (isAvailable) {
            slots.push({
              start: slotStart.toISOString(),
              end: slotEnd.toISOString(),
              duration: durationMinutes
            });
          }
          
          slotStart = new Date(slotStart.getTime() + (30 * 60000)); // 30-minute intervals
        }
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return slots.slice(0, 10); // Return first 10 available slots
  }

  formatGoogleEvents(events) {
    return events.map(event => ({
      id: event.id,
      title: event.summary || 'No Title',
      startTime: event.start?.dateTime || event.start?.date,
      endTime: event.end?.dateTime || event.end?.date,
      description: event.description || '',
      location: event.location || '',
      attendees: event.attendees || [],
      platform: 'google',
      link: event.htmlLink
    }));
  }

  formatCalendlyEvents(events) {
    return events.map(event => ({
      id: event.uri.split('/').pop(),
      title: event.name || 'Calendly Meeting',
      startTime: event.start_time,
      endTime: event.end_time,
      description: event.event_type?.description_plain || '',
      location: event.location?.join(', ') || 'Online',
      platform: 'calendly',
      status: event.status,
      link: event.calendar_event?.external_id
    }));
  }

  formatGoogleEventData(data) {
    return {
      summary: data.title || 'New Appointment',
      description: data.description || '',
      start: {
        dateTime: data.startTime,
        timeZone: data.timeZone || 'America/New_York'
      },
      end: {
        dateTime: data.endTime,
        timeZone: data.timeZone || 'America/New_York'
      },
      attendees: data.attendees ? data.attendees.map(email => ({ email })) : [],
      location: data.location || ''
    };
  }

  formatSchedulingResponse(meetings) {
    if (meetings.length === 0) {
      return 'I can help you schedule an appointment. What type of meeting would you like to set up and when would be convenient for you?';
    }
    
    const nextMeeting = meetings[0];
    const nextMeetingDate = new Date(nextMeeting.startTime).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `I'd be happy to help you schedule an appointment. Your next scheduled meeting is "${nextMeeting.title}" on ${nextMeetingDate}. Would you like to schedule something before or after that?`;
  }

  formatAvailabilityResponse(slots) {
    if (slots.length === 0) {
      return 'I don\'t see any available slots in the next week. Please contact us directly to find a suitable time.';
    }
    
    const formattedSlots = slots.slice(0, 3).map(slot => {
      const start = new Date(slot.start);
      return start.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    });
    
    return `Here are some available time slots:\n${formattedSlots.map((slot, i) => `${i + 1}. ${slot}`).join('\n')}\n\nWould you like to schedule one of these times?`;
  }

  formatUpcomingMeetingsResponse(meetings) {
    if (meetings.length === 0) {
      return 'You don\'t have any upcoming meetings scheduled.';
    }
    
    if (meetings.length === 1) {
      const meeting = meetings[0];
      const meetingDate = new Date(meeting.startTime).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return `You have one upcoming meeting: "${meeting.title}" scheduled for ${meetingDate}.`;
    }
    
    let response = `You have ${meetings.length} upcoming meetings:\n`;
    meetings.slice(0, 5).forEach((meeting, index) => {
      const meetingDate = new Date(meeting.startTime).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      response += `${index + 1}. ${meeting.title} - ${meetingDate}\n`;
    });
    
    return response;
  }

  generateCalendlyBookingUrl(data) {
    // This would be configured based on your Calendly setup
    const baseUrl = this.calendlyConfig?.bookingUrl || 'https://calendly.com/your-username';
    return `${baseUrl}?prefill_email=${encodeURIComponent(data.email || '')}&prefill_name=${encodeURIComponent(data.name || '')}`;
  }

  getAvailablePlatforms() {
    return {
      google: this.isGoogleConnected(),
      calendly: this.isCalendlyConnected()
    };
  }
}

// Export singleton instance
export const calendarService = new CalendarService();
export default calendarService;