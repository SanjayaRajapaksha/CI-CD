import { PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { useEffect, useState } from 'react';

const TASK_API_BASE = 'http://localhost:5000/api/task';

function Task() {
  const userId = localStorage.getItem('userId');
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;
  const [form, setForm] = useState({
    projectName: '',
    taskName: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    status: 'pending'
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

    useEffect(() => {
      if (!userId) return;
      fetchTasks();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    // Pagination logic
    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);

    // Calculate total pages
    const totalPages = Math.ceil(tasks.length / tasksPerPage);

  const fetchTasks = () => {
    setLoading(true);
    axios.get(`${TASK_API_BASE}/taskGetAll`)
      .then(res => {
        const userTasks = res.data.tasks.filter(t => t.userId == userId);
        setTasks(userTasks);
        setLoading(false);
      });
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    const payload = { ...form, userId };
    if (editingId) {
      await axios.put(`${TASK_API_BASE}/taskUpdate/${editingId}`, payload);
    } else {
      await axios.post(`${TASK_API_BASE}/taskAdd`, payload);
    }
    resetForm();
    fetchTasks();
  };

  const handleEdit = task => {
    setForm({
      projectName: task.projectName,
      taskName: task.taskName,
      description: task.description,
      startDate: task.startDate || '',
      startTime: task.startTime || '',
      endDate: task.endDate || '',
      endTime: task.endTime || '',
      status: task.status
    });
    setEditingId(task.id);
    setShowModal(true);
  };

  const handleDelete = async id => {
    setLoading(true);
    await axios.delete(`${TASK_API_BASE}/taskDelete/${id}`);
    fetchTasks();
  };

  const resetForm = () => {
    setForm({ projectName: '', taskName: '', description: '', startDate: '', startTime: '', endDate: '', endTime: '', status: 'pending' });
    setEditingId(null);
    setShowModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 mt-10 bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-3xl shadow-2xl">
      <h2 className="text-2xl font-bold text-gray-800">My Tasks</h2>

      <div className="flex justify-end mb-6">
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105"
        >
          <PlusIcon className="w-5 h-5" /> Add Task
        </button>
      </div>

      {loading ? (
        <div className="text-center text-blue-500 animate-pulse">Loading...</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-blue-200 shadow-md">
            <table className="min-w-full border-collapse">
              <thead className="bg-blue-200 text-blue-900">
                <tr>
                  {['Project', 'Task Name', 'Description', 'Start Date', 'Start Time', 'End Date', 'End Time', 'Status', 'Actions'].map((header, i) => (
                    <th key={i} className="py-3 px-4 text-sm font-bold border">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentTasks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-gray-500 py-6">No tasks found.</td>
                  </tr>
                ) : (
                  currentTasks.map(task => (
                    <tr key={task.id} className="bg-white hover:bg-blue-50 transition-all">
                      <td className="py-3 px-4 border font-semibold text-blue-700">{task.projectName}</td>
                      <td className="py-3 px-4 border">{task.taskName}</td>
                      <td className="py-3 px-4 border">{task.description}</td>
                      <td className="py-3 px-4 border">{task.startDate}</td>
                      <td className="py-3 px-4 border">{task.startTime}</td>
                      <td className="py-3 px-4 border">{task.endDate}</td>
                      <td className="py-3 px-4 border">{task.endTime}</td>
                      <td className="py-3 px-4 border">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm 
                          ${task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 border">
                        <div className="flex gap-2 items-center justify-center">
                          <button
                            onClick={() => handleEdit(task)}
                            className="flex items-center gap-1 bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 shadow transition"
                          >
                            <PencilSquareIcon className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 shadow transition"
                          >
                            <TrashIcon className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
                  border: '1px solid #007bff',
                  background: currentPage === pageNum ? '#007bff' : '#fff',
                  color: currentPage === pageNum ? '#fff' : '#007bff',
                  fontWeight: currentPage === pageNum ? 'bold' : 'normal',
                  cursor: 'pointer',
                  boxShadow: currentPage === pageNum ? '0 2px 8px #007bff33' : 'none'
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
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white bg-opacity-90 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative border border-blue-300 max-h-[90vh] overflow-y-auto transform transition-all scale-105">
            <button
              type="button"
              className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold"
              onClick={resetForm}
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-6 text-blue-700 text-center">{editingId ? 'Edit Task' : 'Add Task'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">

              <label className="block text-sm font-semibold text-gray-700">Project Name</label>
              <input name="projectName" value={form.projectName} onChange={handleChange} placeholder="Enter project name" required className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-400" />

              <label className="block text-sm font-semibold text-gray-700">Task Name</label>
              <input name="taskName" value={form.taskName} onChange={handleChange} placeholder="Enter task name" required className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-400" />

              <label className="block text-sm font-semibold text-gray-700">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Enter description" className="border rounded px-3 py-2 w-full resize-none focus:ring-2 focus:ring-blue-400" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Start Date</label>
                  <input name="startDate" value={form.startDate} onChange={handleChange} type="date" required className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Start Time</label>
                  <input name="startTime" value={form.startTime} onChange={handleChange} type="time" required className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>

  {/* ...existing code... */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">End Date</label>
                  <input name="endDate" value={form.endDate} onChange={handleChange} type="date" className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">End Time</label>
                  <input name="endTime" value={form.endTime} onChange={handleChange} type="time" className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>

              <label className="block text-sm font-semibold text-gray-700">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-400">
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>

              <div className="flex gap-4 justify-center items-center mt-6">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transform hover:scale-105">
                  {editingId ? 'Update' : 'Add'} Task
                </button>
                <button type="button" className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold shadow hover:bg-gray-300 transform hover:scale-105" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Task;
