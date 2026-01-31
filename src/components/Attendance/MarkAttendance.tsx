import { useState, useEffect } from 'react';
import { employeeApi, attendanceApi } from '../../services/api';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';

/* ===================== INTERFACES ===================== */

interface Employee {
  id: number;
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
}

interface AttendanceFormData {
  employee_id: string;
  attendance_date: string;
  status: 'PRESENT' | 'ABSENT';
}

interface MarkAttendanceProps {
  onAttendanceMarked?: () => void;
}

/* ===================== COMPONENT ===================== */

const MarkAttendance = ({ onAttendanceMarked }: MarkAttendanceProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState<AttendanceFormData>({
    employee_id: '',
    attendance_date: new Date().toISOString().split('T')[0],
    status: 'PRESENT'
  });

  const [errors, setErrors] = useState<
    Partial<AttendanceFormData> & { submit?: string }
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [employeesError, setEmployeesError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  /* ===================== EFFECTS ===================== */

  useEffect(() => {
    fetchEmployees();
  }, []);

  /* ===================== API CALLS ===================== */

  const fetchEmployees = async () => {
    setIsLoadingEmployees(true);
    setEmployeesError('');
    try {
      const data = await employeeApi.getEmployees();
      setEmployees(data);
    } catch (err: any) {
      setEmployeesError(
        err.response?.data?.message ||
        'Failed to fetch employees. Please try again.'
      );
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  /* ===================== VALIDATION ===================== */

  const validateForm = () => {
    const newErrors: Partial<AttendanceFormData> = {};

    if (!formData.employee_id) {
      newErrors.employee_id = 'Please select an employee';
    }

    if (!formData.attendance_date) {
      newErrors.attendance_date = 'Date is required';
    }

    if (!formData.status) {
      (newErrors as any).status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ===================== HANDLERS ===================== */

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name as keyof AttendanceFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setSuccessMessage('');

    try {
      await attendanceApi.markAttendance(formData);
      setSuccessMessage('Attendance marked successfully!');
      setFormData({
        employee_id: '',
        attendance_date: new Date().toISOString().split('T')[0],
        status: 'PRESENT',
      });
      setErrors({});
      onAttendanceMarked?.();
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Failed to mark attendance. Please try again.';
      
      // Check for specific error types
      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists')) {
        setErrors({ submit: 'Attendance for this employee on this date already exists.' });
      } else if (errorMessage.toLowerCase().includes('employee')) {
        setErrors({ employee_id: errorMessage });
      } else {
        setErrors({ submit: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ===================== UI STATES ===================== */

  if (isLoadingEmployees) {
    return (
      <div className="bg-white shadow rounded-lg p-6 flex justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (employeesError) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <ErrorMessage message={employeesError} onRetry={fetchEmployees} />
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium">No employees available</h3>
        <p className="text-gray-500 mt-1">
          Please add employees before marking attendance.
        </p>
      </div>
    );
  }

  /* ===================== RENDER ===================== */

  return (
    <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-200">
      <div className="flex items-center mb-8">
        <div className="bg-green-100 rounded-full p-3 mr-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mark Attendance</h2>
          <p className="text-gray-600 text-sm mt-1">Record employee attendance for today</p>
        </div>
      </div>

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 p-4 rounded">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {errors.submit && (
        <div className="mb-4 bg-red-50 border border-red-200 p-4 rounded">
          <p className="text-red-800">{errors.submit}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Employee</label>
          <select
            name="employee_id"
            value={formData.employee_id}
            onChange={handleInputChange}
            className={`mt-1 w-full px-4 py-3 rounded-lg border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.employee_id ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
            }`}
          >
            <option value="">Select employee</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.employee_id}>
                {emp.full_name} ({emp.employee_id}) – {emp.department}
              </option>
            ))}
          </select>
          {errors.employee_id && (
            <p className="text-sm text-red-600 mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.employee_id}
            </p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
          <input
            type="date"
            name="attendance_date"
            value={formData.attendance_date}
            max={new Date().toISOString().split('T')[0]}
            onChange={handleInputChange}
            className={`mt-1 w-full px-4 py-3 rounded-lg border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              errors.attendance_date ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
            }`}
          />
          {errors.attendance_date && (
            <p className="text-sm text-red-600 mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.attendance_date}
            </p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="mt-1 w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
          </select>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center shadow-lg"
          >
            {isLoading && (
              <span className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isLoading ? 'Marking…' : 'Mark Attendance'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MarkAttendance;
