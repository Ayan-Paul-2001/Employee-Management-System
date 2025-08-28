'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { employeeApi } from '@/lib/api/employee';
import { Employee } from '@/lib/api/employee';

export default function EmployeeList() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      // In a real app, this would use pagination parameters
      const response = await employeeApi.getAllEmployees();
      
      // For demo purposes, we'll simulate pagination on the client side
      setEmployees(response);
      setTotalPages(Math.ceil(response.length / 10));
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setError('Failed to load employees. Please try again later.');
      setLoading(false);
      
      // For demo purposes, set mock data
      const mockEmployees: Employee[] = [
        { id: '1', name: 'John Doe', email: 'john@example.com', position: 'Software Engineer', department: 'Engineering', joinDate: '2022-01-15', status: 'ACTIVE' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', position: 'Product Manager', department: 'Product', joinDate: '2021-08-10', status: 'ACTIVE' },
        { id: '3', name: 'Michael Johnson', email: 'michael@example.com', position: 'UI/UX Designer', department: 'Design', joinDate: '2022-03-22', status: 'ACTIVE' },
        { id: '4', name: 'Emily Brown', email: 'emily@example.com', position: 'HR Specialist', department: 'Human Resources', joinDate: '2021-05-18', status: 'ACTIVE' },
        { id: '5', name: 'David Wilson', email: 'david@example.com', position: 'Marketing Coordinator', department: 'Marketing', joinDate: '2022-02-08', status: 'ACTIVE' },
        { id: '6', name: 'Sarah Taylor', email: 'sarah@example.com', position: 'Financial Analyst', department: 'Finance', joinDate: '2021-11-30', status: 'ACTIVE' },
        { id: '7', name: 'Robert Martinez', email: 'robert@example.com', position: 'IT Support', department: 'IT', joinDate: '2022-04-05', status: 'ACTIVE' },
        { id: '8', name: 'Lisa Anderson', email: 'lisa@example.com', position: 'Content Writer', department: 'Marketing', joinDate: '2021-09-14', status: 'ACTIVE' },
        { id: '9', name: 'James Thomas', email: 'james@example.com', position: 'Backend Developer', department: 'Engineering', joinDate: '2022-01-20', status: 'ACTIVE' },
        { id: '10', name: 'Jennifer White', email: 'jennifer@example.com', position: 'Project Manager', department: 'Product', joinDate: '2021-07-25', status: 'ACTIVE' },
        { id: '11', name: 'Daniel Harris', email: 'daniel@example.com', position: 'DevOps Engineer', department: 'Engineering', joinDate: '2022-05-10', status: 'ACTIVE' },
        { id: '12', name: 'Amanda Clark', email: 'amanda@example.com', position: 'Customer Support', department: 'Support', joinDate: '2021-10-12', status: 'ACTIVE' },
      ];
      
      setEmployees(mockEmployees);
      setTotalPages(Math.ceil(mockEmployees.length / 10));
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeApi.deleteEmployee(id);
        // Refresh the employee list
        fetchEmployees();
      } catch (err) {
        console.error('Failed to delete employee:', err);
        alert('Failed to delete employee. Please try again.');
      }
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const employeesPerPage = 10;
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
        <Link 
          href="/dashboard/employees/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Add Employee</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Desktop view - Table */}
      <div className="hidden md:block bg-white shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Join Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentEmployees.length > 0 ? (
              currentEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-800 font-medium">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(employee.joinDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => router.push(`/dashboard/employees/${employee.id}/edit`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Mobile view - Card list */}
      <div className="md:hidden space-y-4">
        {currentEmployees.length > 0 ? (
          currentEmployees.map((employee) => (
            <div key={employee.id} className="bg-white shadow overflow-hidden rounded-md">
              <div 
                className="px-4 py-4 flex justify-between items-center cursor-pointer"
                onClick={() => setExpandedEmployee(expandedEmployee === employee.id ? null : employee.id)}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-800 font-medium">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    <div className="text-xs text-gray-500">{employee.position}</div>
                  </div>
                </div>
                <ChevronDown 
                  className={`h-5 w-5 text-gray-400 transition-transform ${expandedEmployee === employee.id ? 'transform rotate-180' : ''}`} 
                  aria-hidden="true"
                />
              </div>
              
              {expandedEmployee === employee.id && (
                <div className="border-t border-gray-200 px-4 py-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{employee.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="text-sm text-gray-900">{employee.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Join Date</p>
                    <p className="text-sm text-gray-900">{new Date(employee.joinDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {employee.status}
                    </span>
                  </div>
                  <div className="pt-2 flex space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/employees/${employee.id}/edit`);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(employee.id);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-md p-4 text-center text-sm text-gray-500">
            No employees found
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredEmployees.length > employeesPerPage && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-md shadow">
          {/* Mobile pagination */}
          <div className="flex flex-1 justify-between sm:hidden">
            <div className="flex items-center">
              <p className="text-sm text-gray-700 mr-2">
                Page {currentPage} of {totalPages}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          
          {/* Desktop pagination */}
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstEmployee + 1}</span> to{' '}
                <span className="font-medium">
                  {indexOfLastEmployee > filteredEmployees.length
                    ? filteredEmployees.length
                    : indexOfLastEmployee}
                </span>{' '}
                of <span className="font-medium">{filteredEmployees.length}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(number => {
                    // On smaller screens, show fewer page numbers
                    if (totalPages <= 5) return true;
                    return (
                      number === 1 ||
                      number === totalPages ||
                      Math.abs(currentPage - number) <= 1
                    );
                  })
                  .map((number, i, filtered) => {
                    // Add ellipsis where needed
                    const prevNumber = filtered[i - 1];
                    if (prevNumber && number - prevNumber > 1) {
                      return [
                        <span key={`ellipsis-${prevNumber}`} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700">
                          ...
                        </span>,
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            number === currentPage
                              ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                          }`}
                        >
                          {number}
                        </button>
                      ];
                    }
                    return (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          number === currentPage
                            ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        }`}
                      >
                        {number}
                      </button>
                    );
                  })}
                <button
                  onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}