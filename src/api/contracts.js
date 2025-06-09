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

export const fetchContracts = async (token) => {
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
          },
          file: true
        }
      },
      { encodeValuesOnly: true }
    );

    const response = await apiClient.get(`/api/contracts?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return {
      data: response.data.data || [],
      meta: response.data.meta || {}
    };
  } catch (error) {
    console.error('Error fetching contracts:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to fetch contracts');
  }
};

export const fetchContractById = async (token, documentId) => {
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
          },
          file: true
        }
      },
      { encodeValuesOnly: true }
    );

    const response = await apiClient.get(`/api/contracts/${documentId}?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching contract:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to fetch contract');
  }
};

export const createContract = async (token, data) => {
  try {
    // Use connect for employee, assign file directly for one-to-one (matching original implementation)
    const payload = {
      ...data,
      ...(data.employee && { employee: { connect: [data.employee] } }),
      ...(data.file && { file: data.file })
    };

    const response = await apiClient.post(
      '/api/contracts',
      {
        data: payload
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
    console.error('Error creating contract:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to create contract');
  }
};

export const updateContract = async (token, documentId, data) => {
  try {
    // Use connect for employee, assign file directly for one-to-one (matching original implementation)
    const payload = {
      ...data,
      ...(data.employee && { employee: { connect: [data.employee] } }),
      ...(data.file && { file: data.file })
    };

    const response = await apiClient.put(
      `/api/contracts/${documentId}`,
      {
        data: payload
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
    console.error('Error updating contract:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to update contract');
  }
};

export const deleteContract = async (token, documentId) => {
  try {
    const response = await apiClient.delete(`/api/contracts/${documentId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting contract:', error);
    throw new Error(error.response?.data?.error?.message || 'Failed to delete contract');
  }
};
