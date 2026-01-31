import { useState, useEffect } from 'react';
import { employeeApi } from '../../services/api';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';
import EmptyState from '../UI/EmptyState';
import Pagination from '../UI/Pagination';

interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
  createdAt?: string;
}

interface EmployeeListProps {
  refreshTrigger?: number;
}

const EmployeeList = ({ refreshTrigger }: EmployeeListProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const fetchEmployees = async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await employeeApi.getEmployees();
      setAllEmployees(data);
      setEmployees(data);
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Failed to fetch employees. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [refreshTrigger]);

  // Pagination logic
  useEffect(() => {
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = allEmployees.slice(indexOfFirstRecord, indexOfLastRecord);
    setEmployees(currentRecords);
  }, [currentPage, allEmployees, recordsPerPage]);

  const totalPages = Math.ceil(allEmployees.length / recordsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(employeeId);

    try {
      await employeeApi.deleteEmployee(employeeId);
      setAllEmployees(prev => prev.filter(emp => emp.employee_id !== employeeId));
      setEmployees(prev => prev.filter(emp => emp.employee_id !== employeeId));
    } catch (error: any) {
      const errorMessage = error.userMessage || error.message || 'Failed to delete employee. Please try again.';
      setError(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <ErrorMessage 
          message={error} 
          onRetry={fetchEmployees}
        />
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-200">
        <EmptyState
          title="No employees found"
          description="Get started by adding your first employee."
          icon={
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
      <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Employee List</h2>
              <p className="text-gray-600 text-sm mt-1">Manage your team members</p>
            </div>
          </div>
          <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
            {allEmployees.length} {allEmployees.length === 1 ? 'Employee' : 'Employees'}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Employee ID
              </th>
              <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Email
              </th>
              <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Department
              </th>
              <th className="px-8 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center">
                    <div className="bg-gray-100 rounded-full p-2 mr-3">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                    </div>
                    {employee.employee_id}
                  </div>
                </td>
                <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {employee.full_name}
                </td>
                <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {employee.email}
                  </div>
                </td>
                <td className="px-8 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                    {employee.department}
                  </span>
                </td>
                <td className="px-8 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDeleteEmployee(employee.employee_id)}
                    disabled={deleteLoading === employee.employee_id}
                    className="text-red-600 hover:text-red-900 hover:bg-red-50 disabled:text-red-300 disabled:cursor-not-allowed px-3 py-1 rounded-lg transition-all duration-200 flex items-center ml-auto"
                  >
                    {deleteLoading === employee.employee_id ? (
                      <div className="flex items-center">
                        <LoadingSpinner size="small" />
                        <span className="ml-2">Deleting...</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {allEmployees.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalRecords={allEmployees.length}
          recordsPerPage={recordsPerPage}
        />
      )}
    </div>
  );
};

export default EmployeeList;
