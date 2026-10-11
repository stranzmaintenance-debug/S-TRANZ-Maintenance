import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

export const LoginScreen: React.FC = () => {
  const { login, officeDetails, loginBg } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both Email ID and Password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      if (!res.success) {
        setError(res.message);
      }
      setLoading(false);
    }, 200);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-[#05080f]">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${loginBg})` }}
      />
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#05080f] via-[#090e1a]/85 to-[#0b1324]/90" />

      {/* Main Login Card - ONLY: Logo, Company Name, Email ID, Password, Login Button */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#0b1324]/95 backdrop-blur-md border border-[#1d2d4c] rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-100">
          {/* 1. Company Logo */}
          <div className="flex flex-col items-center text-center mb-6">
            {officeDetails.companyLogo && (
              <div className="mb-3 p-2 bg-[#070c17] rounded-xl border border-[#1e2f50] shadow-md">
                <img
                  src={officeDetails.companyLogo}
                  alt={officeDetails.companyName}
                  className="h-16 w-auto object-contain max-w-[220px]"
                />
              </div>
            )}
            {/* 2. Company Name */}
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white uppercase text-balance">
              {officeDetails.companyName}
            </h1>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/70 border border-red-800/80 text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 3. Email ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email ID
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter Email ID"
                required
                className="w-full px-3.5 py-2.5 bg-[#060a12] border border-[#203152] rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
              />
            </div>

            {/* 4. Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter Password"
                required
                className="w-full px-3.5 py-2.5 bg-[#060a12] border border-[#203152] rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
              />
            </div>

            {/* 5. Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold rounded-lg shadow-lg hover:shadow-orange-600/30 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
