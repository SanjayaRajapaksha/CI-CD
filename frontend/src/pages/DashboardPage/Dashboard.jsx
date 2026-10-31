import { useCallback, useEffect, useState } from 'react';
import { FaBriefcase, FaCalendarCheck, FaPercentage, FaUserCheck, FaUsers, FaUserTimes } from 'react-icons/fa';
import { attendanceAPI, employeeAPI, positionAPI } from '../../apis/api';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    employeeCount: 0,
    positionCount: 0,
    attendanceCount: 0,
    monthlyStats: {
      totalPresentDays: 0,
      totalAbsentDays: 0,
      averageAttendance: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Initialize month and year
  useEffect(() => {
    const now = new Date();
    setSelectedMonth(String(now.getMonth() + 1).padStart(2, '0'));
    setSelectedYear(String(now.getFullYear()));
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch basic counts
      const [employeeResponse, positionResponse, attendanceResponse] = await Promise.all([
        employeeAPI.getAll(),
        positionAPI.getAll(),
        attendanceAPI.getAll()
      ]);

      const employees = employeeResponse.data.data || [];
      const positions = positionResponse.data.data || [];
      const attendanceRecords = attendanceResponse.data.data || [];

      // Fetch monthly summary data using the same endpoint as Summary page
      const summaryParams = {
        month: parseInt(selectedMonth),
        year: parseInt(selectedYear)
      };
      
      const summaryResponse = await attendanceAPI.getSummary(summaryParams);
      const summaryData = summaryResponse.data.data || [];

      // Calculate monthly statistics using the same logic as Summary page
      const totalPresentDays = summaryData.reduce((sum, item) => sum + item.presentDays, 0);
      const totalAbsentDays = summaryData.reduce((sum, item) => sum + item.absentDays, 0);
      const totalEmployees = summaryData.length;
      const averageAttendance = totalEmployees > 0 
        ? Math.round(summaryData.reduce((sum, item) => sum + item.attendancePercentage, 0) / totalEmployees)
        : 0;

      setDashboardData({
        employeeCount: employees.length,
        positionCount: positions.length,
        attendanceCount: attendanceRecords.length,
        monthlyStats: {
          totalPresentDays,
          totalAbsentDays,
          averageAttendance
        }
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchDashboardData();
    }
  }, [selectedMonth, selectedYear, fetchDashboardData]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your attendance management system</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Employees */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <FaUsers className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.employeeCount}</p>
            </div>
          </div>
        </div>

        {/* Total Positions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <FaBriefcase className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Positions</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.positionCount}</p>
            </div>
          </div>
        </div>

        {/* Total Attendance Records */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <FaCalendarCheck className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Attendance Records</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.attendanceCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3 sm:mb-0">Monthly Attendance Statistics</h3>
          
          {/* Month/Year Filter */}
          <div className="flex gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Monthly Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Present Days */}
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaUserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-700">Total Present Days</p>
                <p className="text-3xl font-bold text-green-800">{dashboardData.monthlyStats.totalPresentDays}</p>
              </div>
            </div>
          </div>

          {/* Total Absent Days */}
          <div className="bg-red-50 rounded-lg p-6 border border-red-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <FaUserTimes className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-red-700">Total Absent Days</p>
                <p className="text-3xl font-bold text-red-800">{dashboardData.monthlyStats.totalAbsentDays}</p>
              </div>
            </div>
          </div>

          {/* Average Attendance */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaPercentage className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-700">Average Attendance</p>
                <p className="text-3xl font-bold text-blue-800">{dashboardData.monthlyStats.averageAttendance}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Text */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            Showing attendance statistics for{' '}
            <span className="font-medium">
              {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
            {' '}with{' '}
            <span className="font-medium text-green-600">{dashboardData.monthlyStats.totalPresentDays} present</span>
            {' '}and{' '}
            <span className="font-medium text-red-600">{dashboardData.monthlyStats.totalAbsentDays} absent</span>
            {' '}days.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
