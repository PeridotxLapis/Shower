import React, { useState } from 'react';
import { useAuth } from './AuthContext';

export function AuthPage() {
  const { signUp, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(/f3a79899-1828-4224-9a11-880d2baf304e.png)',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-md">
        <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-2xl p-8 shadow-xl">
          <h1 className="text-4xl font-bold text-center mb-2 text-white drop-shadow-lg">
            Bathing Tracker
          </h1>
          <p className="text-center text-white/90 mb-8 drop-shadow">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white drop-shadow mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/40 border border-white/50 text-white placeholder-white/70 focus:outline-none focus:bg-white/60"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white drop-shadow mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/40 border border-white/50 text-white placeholder-white/70 focus:outline-none focus:bg-white/60"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/30 border border-red-400/50 text-white text-sm drop-shadow">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white font-bold rounded-lg transition disabled:opacity-50 drop-shadow-lg"
            >
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full mt-4 text-white/90 hover:text-white font-semibold drop-shadow transition"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
