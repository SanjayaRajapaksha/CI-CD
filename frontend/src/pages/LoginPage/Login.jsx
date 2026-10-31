import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Credential_API from "../../apis/api";
import Input from "../../components/Input/Input";

export default function Login({ setToken }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Validation function
  const validate = () => {
    let newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.password.trim()) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return; // stop if validation fails

    try {
      const response = await Credential_API.post("/login", form);
      if (response.data.success === true) {
        setToken(response.data.data.token);
        // Store user id and role for later use
        if (response.data.data.role) {
          localStorage.setItem('role', response.data.data.role);
        }
        if (response.data.data.id) {
          localStorage.setItem('userId', response.data.data.id);
        }
        if (response.data.data.admin) {
          localStorage.setItem('role', response.data.data.admin.role);
          localStorage.setItem('userId', response.data.data.admin.id);
        }
        toast.success("Login successful");
        if (response.data.data.role === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/user-dashboard");
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-200 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-green-700">Login..................</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          <div>
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Sign In
          </button>

          {/* Sign Up Link */}
          <p className="mt-3 text-center text-sm text-blue-700">
            Don't have an account?{" "}
            <NavLink to="/signup" className="text-blue-600 hover:underline">
              Sign Up
            </NavLink>
          </p>

          {/* Forgot Password Link */}
          <p className="mt-2 text-center text-sm text-blue-700">
            <NavLink to="/forgot-password" className="text-blue-600 hover:underline">
              Forgot Password?
            </NavLink>
          </p>
        </form>
      </div>
    </div>
  );
}