import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Copy, Check, Crown, ArrowLeft, Play } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { TypingGame } from '../Game/TypingGame';

export const GameRoom: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const { currentRoom, leaveRoom, setReady } = useGame();
  const { user } = useAuth();

  const currentPlayer = currentRoom?.players.find(p => p.id === user?.id);
  const allReady = currentRoom?.players.every(p => p.isReady) && (currentRoom?.players.length || 0) > 1;

  const copyRoomCode = () => {
    if (currentRoom?.code) {
      navigator.clipboard.writeText(currentRoom.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReady = () => {
    setReady(!currentPlayer?.isReady);
  };

  const startGame = () => {
    if (allReady) {
      setGameStarted(true);
    }
  };

  useEffect(() => {
    if (allReady && currentPlayer?.isHost) {
      const timer = setTimeout(() => {
        setGameStarted(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [allReady, currentPlayer?.isHost]);

  if (gameStarted) {
    return <TypingGame onGameEnd={() => setGameStarted(false)} />;
  }

  if (!currentRoom) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={leaveRoom}
                className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Leave
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{currentRoom.name}</h1>
                  <p className="text-slate-400 text-sm">
                    {currentRoom.players.length}/{currentRoom.maxPlayers} players
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-lg">
                <span className="text-slate-300 text-sm font-medium">Room Code:</span>
                <span className="text-white font-mono text-lg tracking-wider">{currentRoom.code}</span>
                <button
                  onClick={copyRoomCode}
                  className="ml-2 text-slate-400 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Players List */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">Players</h2>
              <div className="space-y-3">
                <AnimatePresence>
                  {currentRoom.players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                        player.isReady 
                          ? 'bg-green-500/10 border border-green-500/20' 
                          : 'bg-slate-700/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={player.avatar}
                            alt={player.username}
                            className="w-12 h-12 rounded-full"
                          />
                          {player.isHost && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                              <Crown className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{player.username}</p>
                          <p className="text-slate-400 text-sm">
                            {player.isHost ? 'Host' : 'Player'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          player.isReady 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-slate-600/50 text-slate-400'
                        }`}>
                          {player.isReady ? 'Ready' : 'Not Ready'}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Ready Button */}
              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <motion.button
                  onClick={handleReady}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    currentPlayer?.isReady
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {currentPlayer?.isReady ? 'Cancel Ready' : 'Ready Up'}
                </motion.button>

                {allReady && currentPlayer?.isHost && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={startGame}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-3 py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Start Game
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Game Info */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">Game Settings</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration</span>
                  <span className="text-white font-medium">{currentRoom.duration}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Players</span>
                  <span className="text-white font-medium">{currentRoom.maxPlayers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className="text-white font-medium capitalize">{currentRoom.status}</span>
                </div>
              </div>
            </motion.div>

            {allReady && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-6 text-center"
              >
                <h3 className="text-green-400 font-bold text-lg mb-2">All Players Ready!</h3>
                <p className="text-slate-300">
                  {currentPlayer?.isHost 
                    ? "You can start the game now" 
                    : "Waiting for host to start..."}
                </p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">Text Preview</h2>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-slate-300 text-sm leading-relaxed">
                  {currentRoom.text.substring(0, 150)}...
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};