import { useEffect, useState } from "react";
import { FaBriefcase, FaChartBar, FaClipboardList, FaTachometerAlt, FaUserTie } from "react-icons/fa";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);
  }, []);

  if (!role) {
    return (
      <aside className="flex items-center justify-center h-full">
        <div className="text-blue-600 animate-pulse">Loading...</div>
      </aside>
    );
  }

  const adminMenuItems = [

    // {
    //   path: "/task-summary-admin",
    //   icon: FaChartBar,
    //   label: "Task Summary (Admin)",
    //   color: "text-blue-600",
    //   hoverColor: "group-hover:text-blue-700",
    //   bgColor: "group-hover:bg-blue-50",
    //   activeBg: "bg-gradient-to-r from-blue-600 to-blue-700"
    // },
    {
      path: "/dashboard",
      icon: FaTachometerAlt,
      label: "Dashboard",
      color: "text-blue-600",
      hoverColor: "group-hover:text-blue-700",
      bgColor: "group-hover:bg-blue-50",
      activeBg: "bg-gradient-to-r from-blue-600 to-blue-700"
    },
    // {
    //   path: "/task",
    //   icon: FaClipboardList,
    //   label: "Task",
    //   color: "text-blue-600",
    //   hoverColor: "group-hover:text-blue-700",
    //   bgColor: "group-hover:bg-blue-50",
    //   activeBg: "bg-gradient-to-r from-blue-600 to-blue-700"
    // },

    {
      path: "/employee",
      icon: FaUserTie,
      label: "Employee",
      color: "text-blue-600",
      hoverColor: "group-hover:text-blue-700",
      bgColor: "group-hover:bg-blue-50",
      activeBg: "bg-gradient-to-r from-blue-600 to-blue-700"
    },
    {
      path: "/position",
      icon: FaBriefcase,
      label: "Position",
      color: "text-blue-600",
      hoverColor: "group-hover:text-blue-700",
      bgColor: "group-hover:bg-blue-50",
      activeBg: "bg-gradient-to-r from-blue-600 to-blue-700"
    },
    {
      path: "/attendance",
      icon: FaClipboardList,
      label: "Attendance",
      color: "text-blue-600",
      hoverColor: "group-hover:text-blue-700",
      bgColor: "group-hover:bg-blue-50",
      activeBg: "bg-gradient-to-r from-blue-600 to-blue-700"
    },
    {
      path: "/summary",
      icon: FaChartBar,
      label: "Attendance Summary",
      color: "text-blue-600",
      hoverColor: "group-hover:text-blue-700",
      bgColor: "group-hover:bg-blue-50",
      activeBg: "bg-gradient-to-r from-blue-600 to-blue-700"
    },
    {
      path: "/task-summary-admin",
      icon: FaChartBar,
      label: "Task Summary",
      color: "text-blue-600",
      hoverColor: "group-hover:text-blue-700",
      bgColor: "group-hover:bg-blue-50",
      activeBg: "bg-gradient-to-r from-blue-600 to-blue-700"
    },
  ];

  const userMenuItems = [
    {
      path: "/user-dashboard",
      icon: FaTachometerAlt,
      label: "Dashboard",
      color: "text-blue-600",
      hoverColor: "group-hover:text-blue-700",
      bgColor: "group-hover:bg-blue-50",
      activeBg: "bg-gradient-to-r from-blue-600 to-blue-700"
    },
    {
      path: "/task",
      icon: FaClipboardList,
      label: "Task",
      color: "text-blue-600",
      hoverColor: "group-hover:text-blue-700",
      bgColor: "group-hover:bg-blue-50",
      activeBg: "bg-gradient-to-r from-blue-600 to-blue-700"
    },
    {
      path: "/task-summary-employee",
      icon: FaChartBar,
      label: "Task Summary", //(Employee)
      color: "text-blue-600",
      hoverColor: "group-hover:text-blue-700",
      bgColor: "group-hover:bg-blue-50",
      activeBg: "bg-gradient-to-r from-blue-600 to-blue-700"
    }
  ];

  const menuItems = role === "admin" ? adminMenuItems : userMenuItems;
  return (
    <aside className="bg-gradient-to-b from-slate-50 to-white border-r border-gray-200 shadow-lg w-16 md:w-64 h-full">
      {/* Header */}


      <nav className="p-4 space-y-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `group flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden ${isActive
                ? `${item.activeBg} text-white shadow-lg transform scale-105`
                : `text-gray-700 hover:bg-white hover:shadow-md hover:scale-102 ${item.bgColor}`
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Background glow for active state */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-50 blur-sm"></div>
                )}

                <div className={`relative z-10 p-2 rounded-lg transition-all duration-300 ${isActive ? 'bg-white/20 shadow-sm' : `${item.bgColor}`
                  }`}>
                  <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive
                      ? 'text-white drop-shadow-sm'
                      : `${item.color} ${item.hoverColor} group-hover:scale-110 group-hover:drop-shadow-sm`
                    }`} />
                </div>

                <span className={`ml-3 font-semibold hidden md:block transition-all duration-300 ${isActive ? 'text-white' : `text-gray-700 ${item.hoverColor}`
                  }`}>
                  {item.label}
                </span>

                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute right-2 w-2 h-2 bg-white rounded-full opacity-80 shadow-sm"></div>
                )}

                {/* Subtle gradient overlay on hover */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {/* <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="hidden md:block text-center">
          <p className="text-xs text-gray-400">© 2024 Dashboard</p>
        </div>
        <div className="md:hidden flex justify-center">
          <div className="w-6 h-1 bg-gray-300 rounded-full"></div>
        </div>
      </div> */}
    </aside>
  );
}

export default Sidebar;