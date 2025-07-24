import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Search, Trophy, LogOut, User, Target } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGame } from '../../context/GameContext';
import { CreateRoomModal } from './CreateRoomModal';
import { JoinRoomModal } from './JoinRoomModal';
import { GameRoom } from './GameRoom';
import { PracticeTypingTest } from '../Practice/PracticeTypingTest';

export const LobbyPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const { user, logout } = useAuth();
  const { currentRoom } = useGame();

  if (currentRoom) {
    return <GameRoom />;
  }

  if (showPractice) {
    return <PracticeTypingTest onBack={() => setShowPractice(false)} />;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">TypingRace Lobby</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar}
                  alt={user?.username}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-white font-medium">{user?.username}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <motion.button
                onClick={() => setShowCreateModal(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-8 h-8 mx-auto mb-2" />
                Create Room
              </motion.button>

              <motion.button
                onClick={() => setShowPractice(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Target className="w-8 h-8 mx-auto mb-2" />
                Practice
              </motion.button>
              <motion.button
                onClick={() => setShowJoinModal(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Search className="w-8 h-8 mx-auto mb-2" />
                Join Room
              </motion.button>
            </motion.div>

            {/* Recent Games */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">Recent Games</h2>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Speed Challenge #{i}</p>
                        <p className="text-slate-400 text-sm">
                          {65 + i * 5} WPM • {92 + i}% accuracy
                        </p>
                      </div>
                    </div>
                    <div className="text-slate-400 text-sm">
                      {i} hour{i > 1 ? 's' : ''} ago
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Player Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <User className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Your Stats</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Best WPM</span>
                  <span className="text-white font-bold text-lg">{user?.bestWPM}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Average Accuracy</span>
                  <span className="text-white font-bold text-lg">{user?.averageAccuracy}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Games Played</span>
                  <span className="text-white font-bold text-lg">{user?.totalGames}</span>
                </div>
              </div>
            </motion.div>

            {/* Online Players */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                Online Players
              </h2>
              
              <div className="space-y-3">
                {['SpeedDemon', 'TypeMaster', 'QuickFingers', 'RaceAce'].map((name, i) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
                        alt={name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-white">{name}</span>
                    </div>
                    <div className="text-slate-400 text-sm">
                      {85 + i * 3} WPM
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateRoomModal onClose={() => setShowCreateModal(false)} />
        )}
        {showJoinModal && (
          <JoinRoomModal onClose={() => setShowJoinModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};