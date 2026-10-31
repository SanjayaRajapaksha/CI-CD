import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import {
  FiAlertTriangle,
  FiChevronDown,
  FiChevronUp,
  FiLogOut,
  FiMenu,
  FiUser,
  FiX,
} from "react-icons/fi";

function Navbar({ setToken }) {
   const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);
  }, []);

  const [showProfile, setShowProfile] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
    setShowProfile(false);
  };

  const confirmLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100">
      {/* Left Side - Logo and Hamburger */}
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-lg hover:bg-gray-100 md:hidden">
          <FiMenu className="text-gray-600" size={20} />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">EMS</span>
          </div>
          <h1 className="hidden md:block text-lg font-semibold text-gray-800">
            Employee Management System
          </h1>
        </div>
      </div>

      {/* Right Side - User Profile */}
      <div className="relative">
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="flex items-center space-x-2 p-1.5 pr-3 rounded-full hover:bg-gray-50 transition-all"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
              <FiUser className="text-indigo-600" size={16} />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-700">{role === 'admin' ? 'Admin' : 'User'}</p>
          </div>
          {showProfile ? (
            <FiChevronUp className="text-gray-400" size={16} />
          ) : (
            <FiChevronDown className="text-gray-400" size={16} />
          )}
        </button>

        {/* Dropdown Menu */}
        {showProfile && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-1 z-50 border border-gray-200">
            {/* <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">Administrator</p>
              <p className="text-xs text-gray-500">admin@company.com</p>
            </div> */}
            <div className="py-1">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-50 transition-colors"
              >
                <FiLogOut className="mr-2.5 text-red-500" size={14} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={cancelLogout}
          ></div>
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all">
              {/* Close Button */}
              <button
                onClick={cancelLogout}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={20} />
              </button>

              {/* Modal Content */}
              <div className="p-8">
                {/* Icon */}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
                  <FiAlertTriangle className="h-8 w-8 text-red-600" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">
                  Sign Out of Your Account?
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 text-center mb-8">
                  You will be logged out of the Attendance Management System. 
                  Any unsaved changes will be lost.
                </p>

                {/* Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  <button
                    onClick={cancelLogout}
                    className="w-full px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="w-full px-6 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg"
                  >
                    Yes, Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

Navbar.propTypes = {
  setToken: PropTypes.func.isRequired,
};

export default Navbar;