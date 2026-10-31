import { useCallback, useEffect, useState } from 'react';
import { FaCalendarAlt, FaChartBar, FaCheckCircle, FaPercentage, FaSearch, FaTimesCircle, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { attendanceAPI } from '../../apis/api';

function Summary() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchName, setSearchName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Fixed at 10 items per page
  const [paginatedData, setPaginatedData] = useState([]);

  // Fetch attendance summary data from API
  const fetchAttendanceSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        month: selectedMonth,
        year: selectedYear
      };
      
      if (searchName.trim()) {
        params.employeeName = searchName.trim();
      }
      
      const response = await attendanceAPI.getSummary(params);
      
      if (response.data.success) {
        setAttendanceData(response.data.data || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch attendance summary');
      }
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
      setError(error.message || 'Failed to fetch attendance data');
      toast.error('Failed to fetch attendance data');
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, searchName]);

  // Generate months array
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  // Generate years array (current year ± 2)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  useEffect(() => {
    // Fetch data when component mounts or filters change
    fetchAttendanceSummary();
  }, [fetchAttendanceSummary]);

  useEffect(() => {
    // Filter data locally for immediate response while typing
    let filtered = attendanceData;

    if (searchName.trim()) {
      filtered = attendanceData.filter(item =>
        item.employeeName.toLowerCase().includes(searchName.toLowerCase()) ||
        item.employeeId.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    setFilteredData(filtered);
    
    // Reset to first page when data changes
    setCurrentPage(1);
  }, [attendanceData, searchName]);

  // Pagination logic
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedData(filteredData.slice(startIndex, endIndex));
  }, [filteredData, currentPage, itemsPerPage]);

  // Calculate pagination info
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, filteredData.length);

  // Pagination handlers
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Calculate summary statistics
  const totalEmployees = filteredData.length;
  const totalPresentDays = filteredData.reduce((sum, item) => sum + item.presentDays, 0);
  const totalAbsentDays = filteredData.reduce((sum, item) => sum + item.absentDays, 0);
  const averageAttendance = totalEmployees > 0 
    ? Math.round(filteredData.reduce((sum, item) => sum + item.attendancePercentage, 0) / totalEmployees)
    : 0;

  const getAttendanceColor = (percentage) => {
    if (percentage >= 95) return 'text-green-600';
    if (percentage >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceBadge = (percentage) => {
    if (percentage >= 95) return 'bg-green-100 text-green-800';
    if (percentage >= 85) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <FaTimesCircle className="h-5 w-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchAttendanceSummary}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-gray-800 mb-2">
          Attendance Summary
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Employee attendance reports and analytics
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Month Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendarAlt className="inline mr-2" />
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendarAlt className="inline mr-2" />
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Search Filter */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaSearch className="inline mr-2" />
              Search Employee
            </label>
            <input
              type="text"
              placeholder="Search by name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalEmployees}</p>
            </div>
            <FaUser className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Present Days</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{totalPresentDays}</p>
            </div>
            <FaCheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Absent Days</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{totalAbsentDays}</p>
            </div>
            <FaTimesCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Average Attendance</p>
              <p className={`text-xl sm:text-2xl font-bold ${getAttendanceColor(averageAttendance)}`}>
                {averageAttendance}%
              </p>
            </div>
            <FaPercentage className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FaChartBar className="mr-2" />
            Employee Attendance Details
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-1">
            <p className="text-sm text-gray-600">
              Showing {startIndex} to {endIndex} of {filteredData.length} employees for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
            </p>
            <div className="text-sm text-gray-500 mt-1 sm:mt-0">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Present Days
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Absent Days
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Days
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.length > 0 ? (
                paginatedData.map((employee, index) => (
                  <tr key={employee.employeeId || index} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                              {employee.employeeName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 sm:ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.employeeName}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            {employee.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {employee.position}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FaCheckCircle className="mr-1 h-3 w-3" />
                        {employee.presentDays}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <FaTimesCircle className="mr-1 h-3 w-3" />
                        {employee.absentDays}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {employee.totalWorkingDays}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAttendanceBadge(employee.attendancePercentage)}`}>
                        {employee.attendancePercentage}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 sm:px-6 py-8 text-center">
                    <div className="text-gray-500">
                      <FaUser className="mx-auto h-8 w-8 mb-2" />
                      <p className="text-sm">No employees found for the selected criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {filteredData.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{startIndex}</span> to{' '}
                  <span className="font-semibold text-gray-900">{endIndex}</span> of{' '}
                  <span className="font-semibold text-gray-900">{filteredData.length}</span> results
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPrevious}
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
                          onClick={() => goToPage(pageNumber)}
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
                  onClick={goToNext}
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
  );
}

export default Summary;
