import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(username, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-secondary p-8 text-white text-center">
        <h1 className="text-3xl font-bold">Create Account</h1>
        <p className="opacity-90">Start your language learning today</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border-l-4 border-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-600 ml-1">
            USERNAME
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-secondary outline-none transition-colors"
            placeholder="CoolUser123"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-600 ml-1">
            EMAIL ADDRESS
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-secondary outline-none transition-colors"
            placeholder="name@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-600 ml-1">
            PASSWORD
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-secondary outline-none transition-colors"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-secondary hover:bg-secondary-dark text-white font-bold py-4 rounded-2xl border-b-4 border-secondary-dark transition-all disabled:opacity-50"
        >
          {loading ? "CREATING ACCOUNT..." : "REGISTER"}
        </button>

        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-bold hover:underline"
            >
              Log in here
            </Link>
          </p>
        </div>
      </form>
    </>
  );
};

export default Register;
