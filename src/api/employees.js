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

// Fetch all employees with relations
export const fetchEmployees = async (token) => {
  try {
    const query = qs.stringify(
      {
        populate: {
          picture: {
            fields: ['url']
          },
          user: {
            fields: ['email']
          }
        }
      },
      { encodeValuesOnly: true }
    );

    const response = await apiClient.get(`/api/employees?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return {
      data: response.data.data || [],
      meta: response.data.meta || {}
    };
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to fetch employees');
  }
};

// Fetch single employee by ID
export const fetchEmployee = async (id, token) => {
  try {
    const query = qs.stringify(
      {
        populate: {
          picture: {
            fields: ['url']
          },
          user: {
            fields: ['email']
          }
        }
      },
      { encodeValuesOnly: true }
    );

    const response = await apiClient.get(`/api/employees/${id}?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching employee:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to fetch employee');
  }
};

// Create new employee
export const createEmployee = async (employeeData, token) => {
  try {
    const response = await apiClient.post(
      '/api/employees',
      {
        data: employeeData
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
    console.error('Error creating employee:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to create employee');
  }
};

// Update employee
export const updateEmployee = async (id, employeeData, token) => {
  try {
    const response = await apiClient.put(
      `/api/employees/${id}`,
      {
        data: employeeData
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
    console.error('Error updating employee:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to update employee');
  }
};

// Delete employee
export const deleteEmployee = async (id, token) => {
  try {
    const response = await apiClient.delete(`/api/employees/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to delete employee');
  }
};

// Upload media (original implementation - needs auth token for Strapi)
export const uploadMedia = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload media');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading media:', error);
    throw new Error('Failed to upload media');
  }
};

// Upload employee picture (wrapper for compatibility)
export const uploadEmployeePicture = async (file, token) => {
  try {
    const formData = new FormData();
    formData.append('files', file, file.name);

    const uploadedData = await uploadMedia(formData);
    return uploadedData[0]; // Return first uploaded file
  } catch (error) {
    console.error('Error uploading picture:', error);
    throw new Error(error.message || 'Failed to upload picture');
  }
};

// Create employee user account (original working implementation)
export const createEmployeeAccount = async (token, data) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/local/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to create employee account');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating employee account:', error);
    throw new Error(error.message || 'Failed to create employee account');
  }
};

// Update employee user account
export const updateEmployeeAccount = async (token, userId, userData) => {
  try {
    const response = await apiClient.put(`/api/users/${userId}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error updating employee account:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to update employee account');
  }
};
