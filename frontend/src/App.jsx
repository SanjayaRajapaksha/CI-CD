import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/SideBar/SideBar";
import Attendance from "./pages/AtendancePage/Attendance";
import Dashboard from "./pages/DashboardPage/Dashboard";
import Employee from "./pages/EmployeePage/Employee";
import ForgotPassword from "./pages/FogotPasswordPage/ForgotPassword";
import Login from "./pages/LoginPage/Login";
import Position from "./pages/PositionPage/Position";
import ResetPassword from "./pages/ResetPasswordPage/ResetPassword";
import Signup from "./pages/SignUpPage/SignUp";
import Summary from "./pages/SummaryPage/Summary";
import Task from "./pages/TaskPages/Task";
import TaskSummaryEmployee from "./pages/TaskPages/TaskSummaryEmployee";
import TaskSummaryToAdmin from "./pages/TaskPages/TaskSummaryToAdmin";
import UserDashboard from "./pages/TaskPages/UserDashboard";


function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        {token ? (
          <Route
            path="*"
            element={
              <div className="flex flex-col h-screen overflow-hidden">
                {/* Fixed Navbar - Full Width */}
                <Navbar setToken={setToken} />
                
                {/* Main Content Area with Sidebar */}
                <div className="flex flex-1 overflow-hidden">
                  {/* Fixed Sidebar */}
                  <Sidebar />
                  
                  {/* Scrollable Content Area */}
                  <main className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="h-full">
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/employee" element={<Employee />} />
                        <Route path="/task" element={<Task />} />
                        <Route path="/task-summary-employee" element={<TaskSummaryEmployee />} />
                        <Route path="/task-summary-admin" element={<TaskSummaryToAdmin />} />
                        <Route path="/user-dashboard" element={<UserDashboard />} />
                        <Route path="/position" element={<Position />} />
                        <Route path="/attendance" element={<Attendance />} />
                        <Route path="/summary" element={<Summary />}  />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                      </Routes>
                    </div>
                  </main>
                </div>
              </div>
            }
          />
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </div>
  );
}

export default App;
