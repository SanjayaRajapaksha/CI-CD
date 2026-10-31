import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { useEffect, useState } from 'react';

const TASK_API_BASE = 'http://localhost:5000/api/task';

function TaskSummaryEmployee() {
  const userId = localStorage.getItem('userId');
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  useEffect(() => {
    if (!userId) return;
    axios.get(`${TASK_API_BASE}/taskGetAll`)
      .then(res => {
        const userTasks = res.data.tasks.filter(t => t.userId == userId);
        setTasks(userTasks);
      });
  }, [userId]);

  // Get unique project names for dropdown
  const projectNames = [...new Set(tasks.map(task => task.projectName))];

  // Apply filters
  const filteredTasks = tasks.filter(task => {
    const matchDate = selectedDate ? task.startDate === selectedDate : true;
    const matchProject = selectedProject ? task.projectName === selectedProject : true;
    return matchDate && matchProject;
  });

  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 9;
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-3xl shadow-2xl mt-10">
      <h2 className="text-2xl font-bold text-gray-800">
        Task Summary
      </h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-end mb-6">
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="border-2 border-indigo-300 rounded-xl px-4 py-2 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <select
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
          className="border-2 border-indigo-300 rounded-xl px-4 py-2 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Projects</option>
          {projectNames.map((name, i) => (
            <option key={i} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* Task Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 mb-8">
        {currentTasks.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-8 text-lg">
            No tasks found for the selected filters.
          </div>
        )}

        {currentTasks.map(task => (
          <div
            key={task.id}
            className={`rounded-2xl shadow-lg p-6 flex flex-col gap-3 transform transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl border
              ${task.status === 'completed'
                ? 'bg-gradient-to-br from-green-100 via-white to-green-50 border-green-300'
                : 'bg-gradient-to-br from-yellow-100 via-white to-yellow-50 border-yellow-300'
              }`}
          >
            {/* Project Name First */}
            <div className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">{task.projectName}</div>

            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-indigo-800">{task.taskName}</div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold
                ${task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
              `}>
                {task.status === 'completed'
                  ? <CheckCircleIcon className="w-4 h-4" />
                  : <ClockIcon className="w-4 h-4" />}
                {task.status}
              </div>
            </div>

            <p className="text-sm text-gray-600 italic">{task.description}</p>

            <div className="mt-auto flex flex-wrap gap-4 text-xs text-gray-500">
              <span>Start: <span className="font-semibold text-indigo-700">{task.startDate} {task.startTime}</span></span>
              <span>End: <span className="font-semibold text-indigo-700">{task.endDate} {task.endTime}</span></span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination controls with number buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', margin: '20px 0' }}>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc', background: currentPage === 1 ? '#eee' : '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
          <button
            key={pageNum}
            onClick={() => setCurrentPage(pageNum)}
            style={{
              padding: '6px 12px',
              margin: '0 2px',
              borderRadius: '6px',
              border: '1px solid #6366f1',
              background: currentPage === pageNum ? '#6366f1' : '#fff',
              color: currentPage === pageNum ? '#fff' : '#6366f1',
              fontWeight: currentPage === pageNum ? 'bold' : 'normal',
              cursor: 'pointer',
              boxShadow: currentPage === pageNum ? '0 2px 8px #6366f133' : 'none'
            }}
          >
            {pageNum}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc', background: currentPage === totalPages ? '#eee' : '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default TaskSummaryEmployee;
