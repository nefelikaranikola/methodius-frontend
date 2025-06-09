// Environment configuration
export const config = {
  // Backend API URL - using environment variable or fallback to localhost
  API_URL: import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:1337',

  // Other configuration options
  APP_NAME: 'Methodius Company Management',
  VERSION: '1.0.0',

  // Pagination defaults
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // File upload limits
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],

  // Date formats
  DATE_FORMAT: 'DD/MM/YYYY',
  DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',

  // Employee statuses
  EMPLOYEE_STATUSES: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    TERMINATED: 'terminated'
  },

  // Leave request statuses
  LEAVE_REQUEST_STATUSES: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
  },

  // Contract statuses
  CONTRACT_STATUSES: {
    ACTIVE: 'active',
    EXPIRED: 'expired',
    TERMINATED: 'terminated'
  }
};

export default config;
