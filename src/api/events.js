import axios from 'axios';
import qs from 'qs';

const BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:1337';

// Fetch all events
export const fetchEvents = async (token) => {
  const query = qs.stringify(
    {
      populate: {
        employee: {
          fields: ['firstName', 'lastName', 'position']
        }
      },
      sort: ['startDate:asc']
    },
    {
      encodeValuesOnly: true
    }
  );

  const response = await axios.get(`${BASE_URL}/api/events?${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
};

// Fetch event by ID
export const fetchEventById = async (token, id) => {
  const query = qs.stringify(
    {
      populate: {
        employee: {
          fields: ['firstName', 'lastName', 'position']
        }
      }
    },
    {
      encodeValuesOnly: true
    }
  );

  const response = await axios.get(`${BASE_URL}/api/events/${id}?${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data.data;
};

// Create new event
export const createEvent = async (token, eventData) => {
  const payload = {
    data: {
      title: eventData.title,
      description: eventData.description || null,
      eventType: eventData.eventType,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      isAllDay: eventData.isAllDay || false,
      ...(eventData.employee && { employee: { connect: [eventData.employee] } })
    }
  };

  const response = await axios.post(`${BASE_URL}/api/events`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
};

// Update event
export const updateEvent = async (token, id, eventData) => {
  const payload = {
    data: {
      title: eventData.title,
      description: eventData.description || null,
      eventType: eventData.eventType,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      isAllDay: eventData.isAllDay || false,
      ...(eventData.employee && { employee: { connect: [eventData.employee] } })
    }
  };

  const response = await axios.put(`${BASE_URL}/api/events/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
};

// Delete event
export const deleteEvent = async (token, id) => {
  const response = await axios.delete(`${BASE_URL}/api/events/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
};
