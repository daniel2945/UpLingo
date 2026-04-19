import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-primary p-8 text-white text-center">
        <h1 className="text-3xl font-bold">Welcome Back!</h1>
        <p className="opacity-90">Log in to continue your journey</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border-l-4 border-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-600 ml-1">EMAIL ADDRESS</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-primary outline-none transition-colors"
            placeholder="name@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-600 ml-1">PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-primary outline-none transition-colors"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl border-b-4 border-primary-dark transition-all disabled:opacity-50"
        >
          {loading ? 'LOGGING IN...' : 'LOG IN'}
        </button>

        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-secondary font-bold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </form>
    </>
  );
};

export default Login;
