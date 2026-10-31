import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { userAPI } from "../../apis/api"; 
import Input from "../../components/Input/Input";

export default function Signup() {
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "",
    address: "",
    contactNumber: "" 
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let newErrors = {};

    // Name validation
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!form.password.trim()) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Address validation
    if (!form.address.trim()) {
      newErrors.address = "Address is required";
    } else if (form.address.length < 5) {
      newErrors.address = "Address must be at least 5 characters";
    }

    // Contact Number validation
    if (!form.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!/^[0-9]{10}$/.test(form.contactNumber)) {
      newErrors.contactNumber = "Contact number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await userAPI.create(form); 
      if (response) {
        toast.success("Registration successful!");
        navigate("/login");
      } else {
        toast.error("Registration failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-200 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-700">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Name */}
          <div>
            <Input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          {/* Email */}
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

          {/* Password */}
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

          {/* Address */}
          <div>
            <Input
              type="text"
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              required
            />
            {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
          </div>

          {/* Contact Number */}
          <div>
            <Input
              type="text"
              name="contactNumber" // Changed from 'contact' to 'contactNumber'
              placeholder="Contact Number"
              value={form.contactNumber}
              onChange={handleChange}
              required
            />
            {errors.contactNumber && <p className="text-red-500 text-sm">{errors.contactNumber}</p>}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-blue-700">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}