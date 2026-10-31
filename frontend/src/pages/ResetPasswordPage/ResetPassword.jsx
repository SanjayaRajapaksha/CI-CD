import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Credential_API from "../../apis/api";

const ResetPassword = () => {
  const [otp, setOTP] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    // OTP validation
    if (!otp.trim()) {
      toast.error("OTP is required");
      return;
    }

    // Password length validation
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      const response = await Credential_API.post("/reset-password", {
        email,
        otp,
        newPassword,
      });

      if (response.data.success) {
        toast.success(response.data.message || "Password reset successfully");
        navigate("/login");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-200 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-700">
          Reset Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* OTP */}
          <input
            type="text"
            placeholder="Enter your OTP"
            className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={otp}
            onChange={(e) => setOTP(e.target.value)}
            required
          />

          {/* Email */}
          <input
            type="email"
            placeholder="Enter your Email"
            className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* New Password */}
          <input
            type="password"
            placeholder="Enter your new password"
            className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
