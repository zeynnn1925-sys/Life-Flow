export interface OutlookEvent {
  id: string;
  subject: string;
  body?: {
    content: string;
    contentType: string;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: {
    displayName: string;
  };
}

export async function fetchOutlookEvents(
  accessToken: string,
  timeMin: Date,
  timeMax: Date
): Promise<OutlookEvent[]> {
  try {
    const startStr = timeMin.toISOString();
    const endStr = timeMax.toISOString();

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${startStr}&endDateTime=${endStr}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Prefer': 'outlook.timezone="UTC"'
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('UNAUTHORIZED');
      }
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to fetch Outlook events');
    }

    const data = await response.json();
    return data.value || [];
  } catch (error) {
    console.error('Error fetching Outlook events:', error);
    throw error;
  }
}

export async function createOutlookEvent(
  accessToken: string,
  event: Partial<OutlookEvent>
): Promise<OutlookEvent> {
  try {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: event.subject,
          body: event.body,
          start: event.start,
          end: event.end,
          location: event.location,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('UNAUTHORIZED');
      }
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create Outlook event');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating Outlook event:', error);
    throw error;
  }
}

export async function deleteOutlookEvent(
  accessToken: string,
  eventId: string
): Promise<void> {
  try {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      if (response.status === 401) {
        throw new Error('UNAUTHORIZED');
      }
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to delete Outlook event');
    }
  } catch (error) {
    console.error('Error deleting Outlook event:', error);
    throw error;
  }
}
