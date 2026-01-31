import axios from 'axios';

// Create Axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Error handling utility
const handleApiError = (error: any): string => {
  if (error.response?.data) {
    const errorData = error.response.data;
    
    // Handle structured error responses
    if (errorData.detail?.message) {
      return errorData.detail.message;
    }
    
    if (errorData.message) {
      return errorData.message;
    }
    
    if (errorData.error) {
      return errorData.error;
    }
    
    // Handle field validation errors
    if (errorData.errors) {
      const errorMessages = Object.values(errorData.errors).flat();
      return errorMessages.join(', ');
    }
    
    // Handle array of errors
    if (Array.isArray(errorData)) {
      return errorData.map(err => err.message || err).join(', ');
    }
  }
  
  // Handle network errors
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please try again.';
  }
  
  if (error.code === 'ERR_NETWORK') {
    return 'Network error. Please check your connection.';
  }
  
  // Handle HTTP status codes
  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'Access denied. You do not have permission.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict. The resource already exists.';
      case 422:
        return 'Validation error. Please check your input.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Error ${error.response.status}: ${error.response.statusText || 'Unknown error'}`;
    }
  }
  
  // Default error message
  return error.message || 'An unexpected error occurred. Please try again.';
};

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      // Server responded with error status
      const { status } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden - show access denied message
          error.userMessage = 'Access denied. You do not have permission to perform this action.';
          break;
        case 404:
          // Not found
          error.userMessage = 'The requested resource was not found.';
          break;
        case 422:
          // Validation error
          error.userMessage = handleApiError(error);
          break;
        case 500:
          // Server error
          error.userMessage = 'Server error. Please try again later.';
          break;
        default:
          // Other errors
          error.userMessage = handleApiError(error);
      }
    } else if (error.request) {
      // Network error
      error.userMessage = 'Network error. Please check your connection and try again.';
    } else {
      // Other errors
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Authentication API functions (Dummy Implementation)
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Dummy authentication logic
    const { email, password } = credentials;
    
    // Demo credentials
    if (email === 'admin@hrms.com' && password === 'admin123') {
      return {
        success: true,
        token: 'dummy-jwt-token-' + Date.now(),
        user: {
          id: '1',
          email: 'admin@hrms.com',
          name: 'Admin User',
          role: 'admin'
        }
      };
    }
    
    // Invalid credentials
    throw {
      response: {
        status: 401,
        data: {
          detail: {
            error: 'Invalid credentials',
            message: 'Invalid email or password',
            code: 'INVALID_CREDENTIALS'
          }
        }
      }
    };
  },

  logout: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Remove token from localStorage
    localStorage.removeItem('authToken');
    
    return {
      success: true,
      message: 'Logged out successfully'
    };
  },

  refreshToken: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const token = localStorage.getItem('authToken');
    if (token) {
      return {
        success: true,
        token: 'refreshed-dummy-jwt-token-' + Date.now()
      };
    }
    
    throw new Error('No token to refresh');
  },

  getCurrentUser: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const token = localStorage.getItem('authToken');
    if (token) {
      return {
        id: '1',
        email: 'admin@hrms.com',
        name: 'Admin User',
        role: 'admin'
      };
    }
    
    throw {
      response: {
        status: 401,
        data: {
          detail: {
            error: 'Unauthorized',
            message: 'Invalid or expired token',
            code: 'INVALID_TOKEN'
          }
        }
      }
    };
  },
};

// Employee API functions
export const employeeApi = {
  // Get all employees
  getEmployees: async () => {
    const response = await api.get('/employees');
    return response.data;
  },

  // Add new employee
  addEmployee: async (employeeData: any) => {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  // Delete employee
  deleteEmployee: async (employeeId: string | number) => {
    const response = await api.delete(`/employees/${employeeId}`);
    return response.data;
  },

  // Update employee
  updateEmployee: async (employeeId: string | number, employeeData: any) => {
    const response = await api.put(`/employees/${employeeId}`, employeeData);
    return response.data;
  },

  // Get single employee
  getEmployee: async (employeeId: string | number) => {
    const response = await api.get(`/employees/${employeeId}`);
    return response.data;
  }
};

// Attendance API functions
export const attendanceApi = {
  // Mark attendance
  markAttendance: async (attendanceData: any) => {
    const response = await api.post('/attendance', attendanceData);
    return response.data;
  },

  // Get attendance by employee
  getAttendanceByEmployee: async (employeeId: string | number, params?: any) => {
    const response = await api.get(`/attendance/${employeeId}`, { params });
    return response.data;
  },

  // Get all attendance records
  getAllAttendance: async (params?: any) => {
    const response = await api.get('/attendance', { params });
    return response.data;
  },

  // Update attendance record
  updateAttendance: async (attendanceId: string | number, attendanceData: any) => {
    const response = await api.put(`/attendance/${attendanceId}`, attendanceData);
    return response.data;
  },

  // Delete attendance record
  deleteAttendance: async (attendanceId: string | number) => {
    const response = await api.delete(`/attendance/${attendanceId}`);
    return response.data;
  }
};

// Export the base axios instance for custom requests
export default api;
