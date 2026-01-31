import { useState, useEffect } from 'react';
import { employeeApi, attendanceApi } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ErrorMessage from '../components/UI/ErrorMessage';

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

const DashboardPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const [employeesData, attendanceData] = await Promise.all([
          employeeApi.getEmployees(),
          attendanceApi.getAllAttendance()
        ]);
        
        setEmployees(employeesData);
        setAttendanceRecords(attendanceData);
      } catch (err: any) {
        const errorMessage = err.userMessage || err.message || 'Failed to fetch dashboard data';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate statistics
  const totalEmployees = employees.length;
  const totalAttendanceRecords = attendanceRecords.length;
  
  const presentRecords = attendanceRecords.filter(record => record.status === 'PRESENT');
  const absentRecords = attendanceRecords.filter(record => record.status === 'ABSENT');
  const totalPresentDays = presentRecords.length;
  const totalAbsentDays = absentRecords.length;
  
  // Calculate present days per employee
  const presentDaysByEmployee = attendanceRecords.reduce<Record<string, number>>((acc, record) => {
    if (record.status === 'PRESENT') {
      acc[record.employee_id] = (acc[record.employee_id] || 0) + 1;
    }
    return acc;
  }, {});

  // Get top performers (employees with most present days)
  const topPerformers = Object.entries(presentDaysByEmployee)
    .map(([employeeId, presentDays]) => {
      const employee = employees.find(emp => emp.employee_id === employeeId);
      return {
        employeeId,
        employeeName: employee?.full_name || 'Unknown',
        department: employee?.department || 'Unknown',
        presentDays
      };
    })
    .sort((a, b) => b.presentDays - a.presentDays)
    .slice(0, 5);

  // Department statistics
  const departmentStats = employees.reduce<Record<string, { total: number; presentDays: number }>>((acc, employee) => {
    const dept = employee.department;
    if (!acc[dept]) {
      acc[dept] = { total: 0, presentDays: 0 };
    }
    acc[dept].total++;
    acc[dept].presentDays += presentDaysByEmployee[employee.employee_id] || 0;
    return acc;
  }, {});

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorMessage message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">HRMS Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of employees and attendance records</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Present Days</p>
              <p className="text-2xl font-bold text-gray-900">{totalPresentDays}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-red-100 rounded-full p-3 mr-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Absent Days</p>
              <p className="text-2xl font-bold text-gray-900">{totalAbsentDays}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-3 mr-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{totalAttendanceRecords}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Performers</h2>
            <p className="text-sm text-gray-600">Employees with most present days</p>
          </div>
          <div className="p-6">
            {topPerformers.length > 0 ? (
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <div key={performer.employeeId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-yellow-100 text-yellow-800 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{performer.employeeName}</p>
                        <p className="text-sm text-gray-600">{performer.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{performer.presentDays} days</p>
                      <p className="text-xs text-gray-500">Present</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No attendance data available
              </div>
            )}
          </div>
        </div>

        {/* Department Statistics */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Department Statistics</h2>
            <p className="text-sm text-gray-600">Employee count and attendance by department</p>
          </div>
          <div className="p-6">
            {Object.keys(departmentStats).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(departmentStats).map(([department, stats]) => (
                  <div key={department} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{department}</p>
                      <p className="text-sm text-gray-600">{stats.total} employees</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">{stats.presentDays} days</p>
                      <p className="text-xs text-gray-500">Total present days</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No department data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Attendance Activity</h2>
          <p className="text-sm text-gray-600">Latest attendance records</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceRecords
                .sort((a, b) => new Date(b.created_at || b.attendance_date).getTime() - new Date(a.created_at || a.attendance_date).getTime())
                .slice(0, 10)
                .map(record => {
                  const employee = employees.find(emp => emp.employee_id === record.employee_id);
                  return (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-gray-900">{employee?.full_name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{record.employee_id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(record.attendance_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.status === 'PRESENT'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
