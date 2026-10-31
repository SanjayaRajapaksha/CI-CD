import axios from 'axios';
import { useEffect, useState } from 'react';

const TASK_API_BASE = 'http://localhost:5000/api/task';
const USER_API_BASE = 'http://localhost:5000/api/users';

export default function TaskSummaryToAdmin() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [searchUser, setSearchUser] = useState('');

  useEffect(() => {
    axios.get(`${TASK_API_BASE}/taskGetAll`).then(res => {
      setTasks(res.data.tasks || []);
    });
    axios.get(`${USER_API_BASE}/getall`).then(res => {
        console.log('Users:', res.data);
      setUsers(res.data.data || []);
    });
  }, []);

  // Get unique project names
  const projectNames = [...new Set(tasks.map(task => task.projectName))];

  // Get unique months from tasks
  const months = [...new Set(tasks.map(task => {
    if (!task.startDate) return '';
    const d = new Date(task.startDate);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }))].filter(Boolean);

  // Filter logic
  const filteredTasks = tasks.filter(task => {
    let matchProject = selectedProject ? task.projectName === selectedProject : true;
    let matchMonth = selectedMonth ? (task.startDate && task.startDate.startsWith(selectedMonth)) : true;
    let matchDate = selectedDate ? task.startDate === selectedDate : true;
    let matchUser = searchUser ? (users.find(u => u.id === task.userId || u._id === task.userId)?.name?.toLowerCase().includes(searchUser.toLowerCase())) : true;
    return matchProject && matchMonth && matchDate && matchUser;
  });

  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTasks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white rounded-3xl shadow-2xl mt-10">
      <h2 className="text-2xl font-bold text-gray-800">
        All User Tasks
      </h2>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-end mb-6">
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="border-2 border-indigo-300 rounded-xl px-4 py-2 w-full md:w-auto">
          <option value="">All Projects</option>
          {projectNames.map((name, i) => (
            <option key={i} value={name}>{name}</option>
          ))}
        </select>
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="border-2 border-indigo-300 rounded-xl px-4 py-2 w-full md:w-auto">
          <option value="">All Months</option>
          {months.map((m, i) => (
            <option key={i} value={m}>{m}</option>
          ))}
        </select>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="border-2 border-indigo-300 rounded-xl px-4 py-2 w-full md:w-auto" />
        <input type="text" placeholder="Search by user name" value={searchUser} onChange={e => setSearchUser(e.target.value)} className="border-2 border-indigo-300 rounded-xl px-4 py-2 w-full md:w-auto" />
      </div>
      {/* Task Table */}
      <div className="overflow-x-auto rounded-xl border border-indigo-200 shadow-md">
        <table className="min-w-full border-collapse">
          <thead className="bg-indigo-200 text-indigo-900">
            <tr>
              <th className="py-3 px-4 text-sm font-bold border">User Name</th>
              <th className="py-3 px-4 text-sm font-bold border">Project</th>
              <th className="py-3 px-4 text-sm font-bold border">Task Name</th>
              <th className="py-3 px-4 text-sm font-bold border">Description</th>
              <th className="py-3 px-4 text-sm font-bold border">Start Date</th>
              <th className="py-3 px-4 text-sm font-bold border">End Date</th>
              <th className="py-3 px-4 text-sm font-bold border">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 py-6">No tasks found.</td>
              </tr>
            ) : (
              currentItems.map(task => {
                // Support both 'id' and '_id' for user lookup
                const user = users.find(u => u.id === task.userId || u._id === task.userId);
                // Fallback to email if name is missing
                const displayName = user?.name || user?.email || 'Unknown';
                return (
                  <tr key={task.id} className="bg-white hover:bg-indigo-50 transition-all">
                    <td className="py-3 px-4 border font-semibold text-indigo-700">{displayName}</td>
                    <td className="py-3 px-4 border">{task.projectName}</td>
                    <td className="py-3 px-4 border">{task.taskName}</td>
                    <td className="py-3 px-4 border">{task.description}</td>
                    <td className="py-3 px-4 border">{task.startDate}</td>
                    <td className="py-3 px-4 border">{task.endDate}</td>
                    <td className="py-3 px-4 border">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm 
                        ${task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {task.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 transition-all duration-150"
          >
            Previous
          </button>
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
                      ? 'bg-indigo-600 text-white border border-indigo-600 shadow-lg'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-indigo-600'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            }
            return null;
          })}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 transition-all duration-150"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
