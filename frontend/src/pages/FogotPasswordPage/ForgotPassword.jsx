import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Credential_API from "../../apis/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    let newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await Credential_API.post("/forgot-password", { email });
      if (response.data.success) {
        toast.success(response.data.message || "OTP sent successfully");
        navigate("/reset-password", { state: { email } });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending reset OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-200 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-700">
          Forgot Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Send OTP
          </button>
        </form>
      </div>
    </div>
  );
}
