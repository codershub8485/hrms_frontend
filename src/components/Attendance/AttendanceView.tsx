import { useState, useEffect } from 'react';
import { employeeApi, attendanceApi } from '../../services/api';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';
import EmptyState from '../UI/EmptyState';
import Pagination from '../UI/Pagination';

/* ===================== INTERFACES ===================== */

interface Employee {
  id: number;
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
}

interface AttendanceRecord {
  id: number;
  employee_id: string;
  attendance_date: string;
  status: 'PRESENT' | 'ABSENT';
  created_at?: string;
}

interface AttendanceViewProps {
  refreshTrigger?: number;
}

/* ===================== COMPONENT ===================== */

const AttendanceView = ({ refreshTrigger }: AttendanceViewProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allAttendanceRecords, setAllAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [error, setError] = useState('');
  const [employeesError, setEmployeesError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 10;

  /* ===================== EFFECTS ===================== */

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchAttendanceByEmployee(selectedEmployee);
    } else {
      fetchAllAttendance();
    }
  }, [selectedEmployee, refreshTrigger]);

  useEffect(() => {
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    setAttendanceRecords(
      allAttendanceRecords.slice(indexOfFirstRecord, indexOfLastRecord)
    );
  }, [currentPage, allAttendanceRecords]);

  /* ===================== API CALLS ===================== */

  const fetchEmployees = async () => {
    setIsLoadingEmployees(true);
    setEmployeesError('');
    try {
      const data = await employeeApi.getEmployees();
      setEmployees(data);
    } catch (err: any) {
      const errorMessage = err.userMessage || err.message || 'Failed to fetch employees';
      setEmployeesError(errorMessage);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const fetchAllAttendance = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await attendanceApi.getAllAttendance();
      setAllAttendanceRecords(data);
      setCurrentPage(1); // ✅ CRITICAL FIX
    } catch (err: any) {
      const errorMessage = err.userMessage || err.message || 'Failed to fetch attendance records';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendanceByEmployee = async (employeeId: string) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await attendanceApi.getAttendanceByEmployee(employeeId);
      setAllAttendanceRecords(data);
      setCurrentPage(1); // ✅ CRITICAL FIX
    } catch (err: any) {
      const errorMessage = err.userMessage || err.message || 'Failed to fetch attendance records';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /* ===================== HELPERS ===================== */

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmployee(e.target.value);
    setCurrentPage(1); // ✅ CRITICAL FIX
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

  const getStatusColor = (status: 'PRESENT' | 'ABSENT') =>
    status === 'PRESENT'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';

  const totalPages = Math.ceil(allAttendanceRecords.length / recordsPerPage);

  /* ===================== EMPLOYEE MAP ===================== */

  const employeeMap = employees.reduce<Record<string, Employee>>((acc, emp) => {
    acc[emp.employee_id] = emp;
    return acc;
  }, {});

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

  /* ===================== RENDER ===================== */

  return (
    <div className="bg-white shadow-xl rounded-xl border border-gray-200">
      <div className="px-8 py-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Attendance Records</h2>

          <select
            value={selectedEmployee}
            onChange={handleEmployeeChange}
            className="w-64 px-4 py-2 rounded-lg border-2 border-gray-200 bg-white text-sm"
          >
            <option value="">All Employees</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.employee_id}>
                {emp.full_name} ({emp.employee_id})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : error ? (
          <ErrorMessage
            message={error}
            onRetry={
              selectedEmployee
                ? () => fetchAttendanceByEmployee(selectedEmployee)
                : fetchAllAttendance
            }
          />
        ) : attendanceRecords.length === 0 ? (
          <EmptyState
            title="No attendance records found"
            description="No attendance data available."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-semibold uppercase">
                      Employee Name
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold uppercase">
                      Employee ID
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold uppercase">
                      Date
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold uppercase">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {attendanceRecords.map(record => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-8 py-4 font-medium">
                        {employeeMap[record.employee_id]?.full_name || 'Unknown'}
                      </td>
                      <td className="px-8 py-4 text-gray-600">
                        {record.employee_id}
                      </td>
                      <td className="px-8 py-4 text-gray-600">
                        {formatDate(record.attendance_date)}
                      </td>
                      <td className="px-8 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalRecords={allAttendanceRecords.length}
                recordsPerPage={recordsPerPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceView;
