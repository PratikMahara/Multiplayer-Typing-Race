import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, Target, Users, Trophy } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { TypingStats } from '../../types';

interface TypingGameProps {
  onGameEnd: () => void;
}

export const TypingGame: React.FC<TypingGameProps> = ({ onGameEnd }) => {
  const { currentRoom, updateProgress } = useGame();
  const { user } = useAuth();
  const [typedText, setTypedText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 100,
    currentWordIndex: 0,
    typedText: '',
    errors: 0,
    startTime: 0,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const words = currentRoom?.text.split(' ') || [];

  const calculateStats = useCallback((typed: string, wordIndex: number, startTime: number): TypingStats => {
    const currentTime = Date.now();
    const timeElapsed = (currentTime - startTime) / 1000 / 60; // in minutes
    
    const totalChars = typed.length;
    const correctChars = typed.split('').filter((char, index) => {
      const originalText = currentRoom?.text.substring(0, totalChars) || '';
      return char === originalText[index];
    }).length;
    
    const errors = totalChars - correctChars;
    const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 100;
    const wpm = timeElapsed > 0 ? (correctChars / 5) / timeElapsed : 0;

    return {
      wpm: Math.round(wpm),
      accuracy: Math.round(accuracy * 10) / 10,
      currentWordIndex: wordIndex,
      typedText: typed,
      errors,
      startTime,
    };
  }, [currentRoom?.text]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameEnded) return;
    
    const value = e.target.value;
    setTypedText(value);

    if (!gameStarted && value.length > 0) {
      setGameStarted(true);
      setStats(prev => ({ ...prev, startTime: Date.now() }));
    }

    if (gameStarted) {
      const newStats = calculateStats(value, currentWordIndex, stats.startTime);
      setStats(newStats);
      updateProgress(
        (value.length / (currentRoom?.text.length || 1)) * 100,
        newStats.wpm,
        newStats.accuracy
      );
    }

    // Update current word index
    const currentText = currentRoom?.text.substring(0, value.length) || '';
    const wordsCompleted = currentText.split(' ').length - 1;
    setCurrentWordIndex(Math.max(0, wordsCompleted));
  };

  const renderText = () => {
    if (!currentRoom?.text) return null;

    const text = currentRoom.text;
    const typed = typedText;
    
    return (
      <div className="text-2xl leading-relaxed font-mono">
        {text.split('').map((char, index) => {
          let className = 'transition-colors duration-75';
          
          if (index < typed.length) {
            if (typed[index] === char) {
              className += ' text-green-400 bg-green-400/10';
            } else {
              className += ' text-red-400 bg-red-400/20';
            }
          } else if (index === typed.length) {
            className += ' text-white bg-blue-500 animate-pulse'; // cursor
          } else {
            className += ' text-slate-500';
          }

          return (
            <span key={index} className={className}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameStarted && timeLeft > 0 && !gameEnded) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameEnded(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, timeLeft, gameEnded]);

  useEffect(() => {
    if (gameEnded) {
      const timer = setTimeout(() => {
        onGameEnd();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [gameEnded, onGameEnd]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  if (!currentRoom) return null;

  const progress = (typedText.length / currentRoom.text.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{timeLeft}s</p>
                  <p className="text-slate-400 text-sm">Time Left</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.wpm}</p>
                  <p className="text-slate-400 text-sm">WPM</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.accuracy}%</p>
                  <p className="text-slate-400 text-sm">Accuracy</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {currentRoom.players.map((player) => (
                <div key={player.id} className="flex items-center gap-2 bg-slate-700/50 px-3 py-2 rounded-lg">
                  <img
                    src={player.avatar}
                    alt={player.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-white text-sm font-medium">{player.username}</p>
                    <p className="text-slate-400 text-xs">{player.wpm} WPM</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 text-sm">Progress</span>
              <span className="text-white text-sm">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl mx-auto w-full">
          {!gameEnded ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Typing Text */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
                <div className="mb-6">
                  {renderText()}
                </div>

                {/* Hidden Input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={typedText}
                  onChange={handleInputChange}
                  className="opacity-0 absolute -top-full -left-full"
                  autoFocus
                  disabled={gameEnded}
                />

                <div className="text-center">
                  <p className="text-slate-400">
                    {gameStarted ? 'Keep typing!' : 'Start typing to begin...'}
                  </p>
                </div>
              </div>

              {/* Live Leaderboard */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Live Standings
                </h3>
                <div className="space-y-3">
                  {currentRoom.players
                    .sort((a, b) => b.wpm - a.wpm)
                    .map((player, index) => (
                      <motion.div
                        key={player.id}
                        layout
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          player.id === user?.id ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-slate-700/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' : 
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-500 text-white' : 'bg-slate-600 text-slate-300'
                          }`}>
                            {index + 1}
                          </div>
                          <img
                            src={player.avatar}
                            alt={player.username}
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="text-white font-medium">{player.username}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-blue-400">{player.wpm} WPM</span>
                          <span className="text-green-400">{player.accuracy}%</span>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white">Game Complete!</h2>
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 max-w-2xl mx-auto">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-3xl font-bold text-blue-400">{stats.wpm}</p>
                    <p className="text-slate-400">WPM</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-400">{stats.accuracy}%</p>
                    <p className="text-slate-400">Accuracy</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-purple-400">{stats.errors}</p>
                    <p className="text-slate-400">Errors</p>
                  </div>
                </div>
              </div>
              <p className="text-slate-400">Returning to lobby in a few seconds...</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};