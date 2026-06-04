import { useState } from 'react';
import { logout } from './api';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import Board from './components/Board';

export default function App() {
  const [user, setUser] = useState<string | null>(() => localStorage.getItem('username'));
  const [showLogin, setShowLogin] = useState(false);

  function handleLogin(username: string) {
    setUser(username);
    setShowLogin(false);
  }

  function handleLogout() {
    logout();
    setUser(null);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} onLogout={handleLogout} onSignIn={() => setShowLogin(true)} />
      <div className="max-w-[860px] mx-auto p-6">
        <Board isAuthenticated={!!user} username={user} />
      </div>
      {showLogin && <LoginForm onLogin={handleLogin} onClose={() => setShowLogin(false)} />}
    </div>
  );
}
