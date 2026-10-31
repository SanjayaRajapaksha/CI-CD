import { useEffect, useState } from "react";
import { employeeAPI, positionAPI } from "../../apis/api";

function Position() {
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState([]);
  const [positionsInUse, setPositionsInUse] = useState(new Set());

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchPositions(), fetchEmployees()]);
    };
    
    fetchData();
  }, []);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await positionAPI.getAll();
      if (response.data.success) {
        setPositions(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch positions from server');
      console.error('Error fetching positions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll();
      if (response.data.success) {
        setEmployees(response.data.data);
        // Create a set of position IDs that are in use by employees
        const usedPositionIds = new Set(
          response.data.data.map(employee => employee.positionId).filter(id => id)
        );
        setPositionsInUse(usedPositionIds);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      // Don't show error for employees fetch as it's secondary
    }
  };

  const handleAddPosition = () => {
    setFormData({ name: "" });
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleEditPosition = (position) => {
    setFormData(position);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDeletePosition = async (id) => {
    if (window.confirm('Are you sure you want to delete this position?')) {
      try {
        const response = await positionAPI.delete(id);
        if (response.data.success) {
          const updatedPositions = positions.filter(pos => pos.id !== id);
          setPositions(updatedPositions);
          
          // Adjust pagination if current page becomes empty
          const newTotalPages = Math.ceil(updatedPositions.length / itemsPerPage);
          if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
          }
          
          // Refresh employee data to update position usage
          await fetchEmployees();
        }
      } catch (err) {
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Failed to delete position');
        }
        console.error('Error deleting position:', err);
      }
    }
  };

  const getEmployeeCount = (positionId) => {
    return employees.filter(emp => emp.positionId === positionId).length;
  };

  const isPositionInUse = (positionId) => {
    return positionsInUse.has(positionId);
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = positions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(positions.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
      if (isEditMode) {
        const response = await positionAPI.update(formData.id, formData);
        if (response.data.success) {
          setPositions(positions.map(pos => 
            pos.id === formData.id ? response.data.data : pos
          ));
        }
      } else {
        const response = await positionAPI.create(formData);
        if (response.data.success) {
          const updatedPositions = [...positions, response.data.data];
          setPositions(updatedPositions);
          
          // Navigate to the last page to show the newly added position
          const newTotalPages = Math.ceil(updatedPositions.length / itemsPerPage);
          setCurrentPage(newTotalPages);
        }
      }
      setShowModal(false);
      // Refresh employee data to update position usage
      await fetchEmployees();
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(`Failed to ${isEditMode ? 'update' : 'create'} position`);
      }
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} position:`, err);
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
          <h1 className="text-2xl font-bold text-gray-800">Position Management</h1>
          <p className="text-gray-600 mt-1">
            Showing {currentItems.length} of {positions.length} positions
          </p>
        </div>
        <button
          onClick={handleAddPosition}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add New Position
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
                  Position Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    {positions.length === 0 
                      ? "No positions found. Add some positions to get started."
                      : "No positions on this page."
                    }
                  </td>
                </tr>
              ) : (
                currentItems.map((position) => {
                  const employeeCount = getEmployeeCount(position.id);
                  const inUse = isPositionInUse(position.id);
                  
                  return (
                    <tr key={position.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {position.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {position.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          employeeCount > 0 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {employeeCount} {employeeCount === 1 ? 'employee' : 'employees'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(position.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditPosition(position)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 px-3 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeletePosition(position.id)}
                          disabled={inUse}
                          className={`px-3 py-1 rounded ${
                            inUse 
                              ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                              : 'text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200'
                          }`}
                          title={inUse ? `Cannot delete: ${employeeCount} employee(s) are assigned to this position` : 'Delete position'}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
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
                    {Math.min(indexOfLastItem, positions.length)}
                  </span> of{' '}
                  <span className="font-semibold text-gray-900">{positions.length}</span> positions
                </div>
                <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>{positions.filter(pos => positionsInUse.has(pos.id)).length} In Use</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span>{positions.filter(pos => !positionsInUse.has(pos.id)).length} Available</span>
                  </div>
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
              {isEditMode ? "Edit Position" : "Add New Position"}
            </h2>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Position Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter position name"
                  value={formData.name}
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

export default Position;