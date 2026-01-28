
import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { AuthState, User } from './types';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  const handleLogin = (user: User) => {
    setAuth({
      isAuthenticated: true,
      user,
    });
  };

  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      user: null,
    });
  };

  const handleUpdateUser = (updatedUser: User) => {
    setAuth(prev => ({
      ...prev,
      user: updatedUser
    }));
  };

  return (
    <div className="min-h-screen">
      {!auth.isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard 
          user={auth.user} 
          onLogout={handleLogout} 
          onUpdateUser={handleUpdateUser} 
        />
      )}
    </div>
  );
};

export default App;
