import React, { createContext, useState, useContext, useEffect } from 'react';
import qs from 'qs';

const AuthContext = createContext(null);

// Base URL configuration
const BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:1337';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userData.documentId);
    setToken(token);
    setUser(userData);
    fetchEmployeeData(userData.documentId, token);
  };

  const logout = () => {
    // Clear all authentication data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');

    // Reset all auth states
    setToken(null);
    setUser(null);
    setEmployee(null);
    setIsLoading(false);

    // Clear any other app-related localStorage data if needed
    // Add any additional cleanup here
  };

  const checkAuth = async () => {
    const storedToken = localStorage.getItem('token');
    setIsLoading(true);

    if (storedToken) {
      try {
        const response = await fetch(`${BASE_URL}/api/users/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          await fetchEmployeeData(userData.documentId, storedToken);
        } else {
          logout();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        logout();
      }
    }
    setIsLoading(false);
  };

  const fetchEmployeeData = async (userId, token) => {
    try {
      const query = qs.stringify(
        {
          filters: {
            user: {
              documentId: {
                $eq: userId
              }
            }
          },
          populate: {
            picture: {
              fields: ['url']
            },
            user: {
              fields: ['email']
            }
          }
        },
        {
          encodeValuesOnly: true
        }
      );

      const response = await fetch(`${BASE_URL}/api/employees?${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const employees = await response.json();
        if (employees.data.length > 0) {
          setEmployee(employees.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch employee data:', error);
    }
  };

  // Check if user has admin privileges
  // Admin = User exists but is NOT connected to an employee entry
  const isAdmin = () => {
    return !!user && !employee;
  };

  // Check if user has HR privileges
  // HR privileges = Admin users (since admins manage the system including HR)
  const isHR = () => {
    return isAdmin();
  };

  // Check if user can access management features (add/delete employees, etc.)
  // Only admin users can access management features
  const canAccessManagement = () => {
    return isAdmin();
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    token,
    user,
    employee,
    isLoading,
    login,
    logout,
    isAdmin,
    isHR,
    canAccessManagement
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
