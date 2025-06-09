import axios from 'axios';
import qs from 'qs';
import { config } from 'utils/config';

const API_URL = config.API_URL;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const fetchLeaveRequests = async (token) => {
  try {
    const query = qs.stringify(
      {
        populate: {
          employee: {
            fields: ['firstName', 'lastName'],
            populate: {
              picture: {
                fields: ['url']
              }
            }
          }
        }
      },
      { encodeValuesOnly: true }
    );

    const response = await apiClient.get(`/api/leave-requests?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return {
      data: response.data.data || [],
      meta: response.data.meta || {}
    };
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to fetch leave requests');
  }
};

export const fetchLeaveRequestsByEmployee = async (token, employeeId) => {
  try {
    const query = qs.stringify(
      {
        filters: {
          employee: {
            id: {
              $eq: employeeId
            }
          }
        },
        populate: {
          employee: {
            fields: ['firstName', 'lastName'],
            populate: {
              picture: {
                fields: ['url']
              }
            }
          }
        }
      },
      { encodeValuesOnly: true }
    );

    const response = await apiClient.get(`/api/leave-requests?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return {
      data: response.data.data || [],
      meta: response.data.meta || {}
    };
  } catch (error) {
    console.error('Error fetching leave requests by employee:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to fetch leave requests');
  }
};

export const fetchLeaveRequestById = async (token, documentId) => {
  try {
    const query = qs.stringify(
      {
        populate: {
          employee: {
            fields: ['firstName', 'lastName'],
            populate: {
              picture: {
                fields: ['url']
              }
            }
          }
        }
      },
      { encodeValuesOnly: true }
    );

    const response = await apiClient.get(`/api/leave-requests/${documentId}?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching leave request:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to fetch leave request');
  }
};

export const createLeaveRequest = async (token, data) => {
  try {
    const response = await apiClient.post(
      '/api/leave-requests',
      {
        data
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('Error creating leave request:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to create leave request');
  }
};

export const updateLeaveRequest = async (token, documentId, data) => {
  try {
    const response = await apiClient.put(
      `/api/leave-requests/${documentId}`,
      {
        data
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('Error updating leave request:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to update leave request');
  }
};

export const deleteLeaveRequest = async (token, documentId) => {
  try {
    const response = await apiClient.delete(`/api/leave-requests/${documentId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting leave request:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to delete leave request');
  }
};
