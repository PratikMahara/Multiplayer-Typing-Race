import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { AuthPage } from './components/Auth/AuthPage';
import { LobbyPage } from './components/Lobby/LobbyPage';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading TypingRace...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!user ? (
        <AuthPage key="auth" />
      ) : (
        <GameProvider>
          <LobbyPage key="lobby" />
        </GameProvider>
      )}
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="font-['Inter',sans-serif] antialiased">
          <Routes>
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;