import { useEffect, useState } from "react";
import { attendanceAPI, employeeAPI, positionAPI } from "../../apis/api";

function Employee() {
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    positionId: "", 
    address: "", 
    contactNumber: "" 
  });
  const [employees, setEmployees] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeesWithAttendance, setEmployeesWithAttendance] = useState(new Set());

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [employeesResponse, positionsResponse, attendanceResponse] = await Promise.all([
        employeeAPI.getAll(),
        positionAPI.getAll(),
        attendanceAPI.getAll()
      ]);

      if (employeesResponse.data.success) {
        setEmployees(employeesResponse.data.data);
      }

      if (positionsResponse.data.success) {
        setPositions(positionsResponse.data.data);
      }

      // Check which employees have attendance records
      if (attendanceResponse.data.success) {
        const employeeIds = new Set();
        attendanceResponse.data.data.forEach(attendance => {
          if (attendance.employeeId) {
            employeeIds.add(attendance.employeeId);
          }
        });
        setEmployeesWithAttendance(employeeIds);
      }
    } catch (err) {
      setError('Failed to fetch data from server');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPositionName = (positionId) => {
    const position = positions.find(p => p.id === positionId);
    return position ? position.name : 'Unknown';
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = employees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(employees.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleAddEmployee = () => {
    setFormData({ name: "", positionId: "", address: "", contactNumber: "" });
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleEditEmployee = (employee) => {
    setFormData(employee);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDeleteEmployee = async (id) => {
    // Check if employee has attendance records
    if (employeesWithAttendance.has(id)) {
      alert('Cannot delete employee because they have attendance records. Please remove their attendance records first.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const response = await employeeAPI.delete(id);
        if (response.data.success) {
          const updatedEmployees = employees.filter(emp => emp.id !== id);
          setEmployees(updatedEmployees);
          
          // Adjust pagination if current page becomes empty
          const newTotalPages = Math.ceil(updatedEmployees.length / itemsPerPage);
          if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
          }
        }
      } catch (err) {
        setError('Failed to delete employee');
        console.error('Error deleting employee:', err);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      // Convert positionId to number
      const submitData = {
        ...formData,
        positionId: parseInt(formData.positionId)
      };

      if (isEditMode) {
        const response = await employeeAPI.update(formData.id, submitData);
        if (response.data.success) {
          setEmployees(employees.map(emp => 
            emp.id === formData.id ? response.data.data : emp
          ));
        }
      } else {
        const response = await employeeAPI.create(submitData);
        if (response.data.success) {
          const updatedEmployees = [...employees, response.data.data];
          setEmployees(updatedEmployees);
          
          // Navigate to the last page to show the newly added employee
          const newTotalPages = Math.ceil(updatedEmployees.length / itemsPerPage);
          setCurrentPage(newTotalPages);
        }
      }
      setShowModal(false);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(`Failed to ${isEditMode ? 'update' : 'create'} employee`);
      }
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} employee:`, err);
    }
  };

if (loading) {
  return (
    <div className="flex flex-col justify-center items-center h-64 gap-4">
      {/* Small circular spinner */}
      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-600"></div>

      {/* Optional loading text */}
      <p className="text-blue-600 text-sm font-medium">Loading, please wait...</p>
    </div>
  );
}


  return (
    <div className="p-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={() => setError('')}
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employee Management</h1>
          <p className="text-gray-600 mt-1">
            Showing {currentItems.length} of {employees.length} employees
          </p>
        </div>
        <button
          onClick={handleAddEmployee}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add New Employee
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    {employees.length === 0 
                      ? "No employees found. Add some employees to get started."
                      : "No employees on this page."
                    }
                  </td>
                </tr>
              ) : (
                currentItems.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {emp.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full from-blue-400 bg-gradient-to-br bg-blue-600 flex items-center justify-center text-white font-semibold">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getPositionName(emp.positionId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {emp.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {emp.contactNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditEmployee(emp)}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteEmployee(emp.id)}
                        disabled={employeesWithAttendance.has(emp.id)}
                        className={`px-3 py-1 rounded ${
                          employeesWithAttendance.has(emp.id)
                            ? 'text-gray-400 bg-gray-200 cursor-not-allowed'
                            : 'text-red-600 hover:text-red-900 bg-red-100'
                        }`}
                        title={employeesWithAttendance.has(emp.id) ? 'Cannot delete employee with attendance records' : 'Delete employee'}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-semibold text-gray-900">
                    {Math.min(indexOfLastItem, employees.length)}
                  </span> of{' '}
                  <span className="font-semibold text-gray-900">{employees.length}</span> employees
                </div>
                <div className="text-xs text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 transition-all duration-150"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    if (pageNumber > 0 && pageNumber <= totalPages) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => paginate(pageNumber)}
                          className={`px-3 py-2 text-sm font-medium transition-all duration-150 ${
                            currentPage === pageNumber
                              ? 'bg-blue-600 text-white border border-blue-600 shadow-lg'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-blue-600'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 transition-all duration-150"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {isEditMode ? "Edit Employee" : "Add New Employee"}
            </h2>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="positionId" className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <select
                  id="positionId"
                  name="positionId"
                  value={formData.positionId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Position</option>
                  {positions.map(position => (
                    <option key={position.id} value={position.id}>
                      {position.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <input
                  id="contactNumber"
                  name="contactNumber"
                  type="text"
                  placeholder="Enter contact number"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditMode ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employee;
