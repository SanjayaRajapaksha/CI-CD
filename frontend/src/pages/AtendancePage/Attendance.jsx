
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { attendanceAPI, employeeAPI, positionAPI } from '../../apis/api';

const Attendance = () => {
  const [employees, setEmployees] = useState([]);
  const [positions, setPositions] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [searchName, setSearchName] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Filtered employees
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchAllData();
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Only reset page when filters change
  useEffect(() => {
    filterEmployees(true);
  }, [employees, searchName, selectedPosition]);

  // Update attendance status without resetting page
  useEffect(() => {
    filterEmployees(false);
  }, [attendances]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [employeeRes, positionRes, attendanceRes] = await Promise.all([
        employeeAPI.getAll(),
        positionAPI.getAll(),
        attendanceAPI.getByDate(selectedDate)
      ]);

      setEmployees(employeeRes.data.data || []);
      setPositions(positionRes.data.data || []);
      setAttendances(attendanceRes.data.data || []);
      
      // toast.success(`Loaded ${employeeRes.data.data?.length || 0} employees for ${selectedDate}`);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceForDate = async (date) => {
    try {
      const attendanceRes = await attendanceAPI.getByDate(date);
      setAttendances(attendanceRes.data.data || []);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setAttendances([]);
    }
  };

  const filterEmployees = (resetPage = false) => {
    let filtered = [...employees];

    // Filter by name
    if (searchName.trim()) {
      filtered = filtered.filter(employee => 
        employee.name?.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Filter by position
    if (selectedPosition) {
      filtered = filtered.filter(employee => 
        employee.positionId?.toString() === selectedPosition
      );
    }

    // Add attendance status to each employee
    const employeesWithAttendance = filtered.map(employee => {
      const attendance = attendances.find(att => att.employeeId === employee.id);
      return {
        ...employee,
        attendanceId: attendance?.id || null,
        isPresent: attendance?.present || false,
        hasAttendance: !!attendance
      };
    });

  setFilteredEmployees(employeesWithAttendance);
  if (resetPage) setCurrentPage(1); // Only reset page when filters change
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchAttendanceForDate(date);
  };

  const markAttendance = async (employeeId, isPresent) => {
    try {
      const employee = filteredEmployees.find(emp => emp.id === employeeId);
      
      if (employee.hasAttendance) {
        // Update existing attendance
        await attendanceAPI.update(employee.attendanceId, { present: isPresent });
      } else {
        // Create new attendance
        await attendanceAPI.create({
          employeeId: employeeId,
          date: selectedDate,
          present: isPresent
        });
      }

      // Refresh attendance data
      await fetchAttendanceForDate(selectedDate);
      // toast.success(`Attendance marked as ${isPresent ? 'Present' : 'Absent'}`);
    } catch (err) {
      console.error('Error marking attendance:', err);
      toast.error('Failed to mark attendance');
    }
  };

  const clearFilters = () => {
    setSearchName('');
    setSelectedPosition('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
        <p className="text-blue-600 text-sm font-medium">Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        {/* <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📅 Simple Attendance Marking
          </h1>
          <p className="text-gray-600">
            Select date, search employees, and mark attendance as Present or Absent
          </p>
        </div> */}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Mark Attendance</h3>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Employee
              </label>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Position
              </label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Positions</option>
                {positions.map(pos => (
                  <option key={pos.id} value={pos.id}>
                    {pos.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
              >
                Clear Filters
              </button>
              <button
                onClick={fetchAllData}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  👥 Employee List - {new Date(selectedDate).toLocaleDateString()}
                </h3>
                <p className="text-sm text-gray-600">
                  Showing {currentItems.length} of {filteredEmployees.length} employees
                  {filteredEmployees.length !== employees.length && (
                    <span className="text-blue-600 ml-1">(filtered from {employees.length} total)</span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mark Attendance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                            {employee.name?.charAt(0)?.toUpperCase() || 'N'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {employee.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.contactNumber || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                          {positions.find(pos => pos.id === employee.positionId)?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {employee.hasAttendance ? (
                          employee.isPresent ? (
                            <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                              ✅ Present
                            </span>
                          ) : (
                            <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                              ❌ Absent
                            </span>
                          )
                        ) : (
                          <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">
                            - Not Marked
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => markAttendance(employee.id, true)}
                            className={`px-4 py-2 text-sm rounded transition-colors ${
                              employee.isPresent && employee.hasAttendance
                                ? 'bg-green-600 text-white' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => markAttendance(employee.id, false)}
                            className={`px-4 py-2 text-sm rounded transition-colors ${
                              employee.hasAttendance && !employee.isPresent
                                ? 'bg-red-600 text-white' 
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-lg font-medium mb-2">No employees found</p>
                        <p className="text-sm">
                          {employees.length === 0 
                            ? 'No employees in the system yet.'
                            : 'Try adjusting your search filters.'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
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
                      {Math.min(indexOfLastItem, filteredEmployees.length)}
                    </span> of{' '}
                    <span className="font-semibold text-gray-900">{filteredEmployees.length}</span> employees
                  </div>
                  <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{filteredEmployees.filter(emp => emp.hasAttendance && emp.isPresent).length} Present</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>{filteredEmployees.filter(emp => emp.hasAttendance && !emp.isPresent).length} Absent</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <span>{filteredEmployees.filter(emp => !emp.hasAttendance).length} Unmarked</span>
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
                      const pageNumber = currentPage <= 3 
                        ? i + 1 
                        : currentPage >= totalPages - 2
                        ? totalPages - 4 + i
                        : currentPage - 2 + i;
                      
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
      </div>
    </div>
  );
};

export default Attendance;