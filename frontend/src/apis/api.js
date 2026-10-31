import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

// Admin API
const Credential_API = axios.create({
  baseURL: `${BASE_URL}/users/`,
});


// Employee API
const Employee_API = axios.create({
  baseURL: `${BASE_URL}/employees/`,
});

// Position API
const Position_API = axios.create({
  baseURL: `${BASE_URL}/positions/`,
});

// Attendance API
const Attendance_API = axios.create({
  baseURL: `${BASE_URL}/attendances/`,
});

//user API
const User_API = axios.create({
  baseURL: `${BASE_URL}/users/`,
});

// Employee API methods
export const employeeAPI = {
  getAll: () => Employee_API.get('getAll'),
  getById: (id) => Employee_API.get(`getById/${id}`),
  create: (data) => Employee_API.post('create', data),
  update: (id, data) => Employee_API.put(`updateById/${id}`, data),
  delete: (id) => Employee_API.delete(`deleteById/${id}`)
};

// Position API methods
export const positionAPI = {
  getAll: () => Position_API.get('getAll'),
  getById: (id) => Position_API.get(`getById/${id}`),
  create: (data) => Position_API.post('create', data),
  update: (id, data) => Position_API.put(`updateById/${id}`, data),
  delete: (id) => Position_API.delete(`deleteById/${id}`)
};

// Attendance API methods
export const attendanceAPI = {
  getAll: () => Attendance_API.get('getAll'),
  getByDate: (date) => Attendance_API.get(`getByDate/${date}`),
  getById: (id) => Attendance_API.get(`getById/${id}`),
  create: (data) => Attendance_API.post('create', data),
  update: (id, data) => Attendance_API.put(`updateById/${id}`, data),
  delete: (id) => Attendance_API.delete(`deleteById/${id}`),
  getSummary: (params) => Attendance_API.get('summary', { params })
};

// User API methods
export const userAPI = {
  getAll: () => User_API.get('getall'),
  getById: (id) => User_API.get(`getUserById/${id}`),
  create: (data) => User_API.post('register', data),
  update: (id, data) => User_API.put(`updateById/${id}`, data),
  delete: (id) => User_API.delete(`deleteById/${id}`)
};

export default Credential_API;
