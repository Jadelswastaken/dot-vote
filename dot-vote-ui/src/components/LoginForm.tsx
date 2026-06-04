import { useState, useEffect, type FormEvent } from 'react';
import { login } from '../api';
import { X } from 'lucide-react';

interface LoginFormProps {
  onLogin: (username: string) => void;
  onClose: () => void;
}

export default function LoginForm({ onLogin, onClose }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(username, password);
      onLogin(data.username);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex flex-col gap-4 bg-viridian p-8 w-[360px] shadow-lg shadow-block-static relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-transparent border-none cursor-pointer p-1 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
        <img
          src="/dot-vote-wide.svg"
          alt="Dot Vote logo"
          className="h-16 w-auto mx-auto"
        />
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="block text-md font-semibold">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                autoFocus
                className="w-full px-3 py-2 text-sm bg-dusty-lavender outline-none shadow-block-static"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-md font-semibold">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full px-3 py-2 text-sm bg-dusty-lavender outline-none shadow-block-static"
              />
            </div>
            {error && <p className="text-red-400 text-md">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-dusty-blue py-2 text-sm font-semibold cursor-pointer hover:bg-hopbush disabled:opacity-50 disabled:cursor-not-allowed shadow-block-dynamic"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
