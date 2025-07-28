import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Settings, ArrowLeft } from 'lucide-react';
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

  const resetGame = () => {
    setTypedText('');
    setGameStarted(false);
    setGameEnded(false);
    setTimeLeft(60);
    setCurrentWordIndex(0);
    setStats({
      wpm: 0,
      accuracy: 100,
      currentWordIndex: 0,
      typedText: '',
      errors: 0,
      startTime: 0,
    });
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const renderWords = () => {
    if (!words.length) return null;

    const typedWords = typedText.split(' ');
    const currentTypedWord = typedWords[typedWords.length - 1] || '';

    return (
      <div className="text-2xl leading-relaxed font-mono select-none">
        {words.map((word, wordIndex) => {
          const isCurrentWord = wordIndex === currentWordIndex;
          const isTypedWord = wordIndex < typedWords.length - 1;
          const typedWord = typedWords[wordIndex] || '';

          return (
            <span key={wordIndex} className="relative">
              {word.split('').map((char, charIndex) => {
                let className = 'transition-colors duration-100';
                
                if (isCurrentWord) {
                  if (charIndex < currentTypedWord.length) {
                    if (currentTypedWord[charIndex] === char) {
                      className += ' text-white bg-transparent';
                    } else {
                      className += ' text-red-400 bg-red-400/20';
                    }
                  } else if (charIndex === currentTypedWord.length) {
                    className += ' text-slate-400 bg-yellow-400 animate-pulse'; // cursor
                  } else {
                    className += ' text-slate-500';
                  }
                } else if (isTypedWord) {
                  if (charIndex < typedWord.length) {
                    if (typedWord[charIndex] === char) {
                      className += ' text-slate-400';
                    } else {
                      className += ' text-red-400 bg-red-400/10';
                    }
                  } else {
                    className += ' text-red-400 bg-red-400/10'; // missing characters
                  }
                } else {
                  className += ' text-slate-500';
                }

                return (
                  <span key={charIndex} className={className}>
                    {char}
                  </span>
                );
              })}
              
              {/* Extra characters typed */}
              {isCurrentWord && currentTypedWord.length > word.length && (
                <span className="text-red-400 bg-red-400/20">
                  {currentTypedWord.substring(word.length)}
                </span>
              )}
              
              {wordIndex < words.length - 1 && (
                <span className={`${
                  wordIndex < typedWords.length - 1 ? 'text-slate-400' : 'text-slate-500'
                }`}> </span>
              )}
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300">
      {/* Top Navigation */}
      <div className="flex items-center justify-between p-6 max-w-6xl mx-auto">
        <button
          onClick={onGameEnd}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">back</span>
        </button>
        
        <div className="flex items-center gap-6">
          <button
            onClick={resetGame}
            className="text-slate-400 hover:text-slate-300 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button className="text-slate-400 hover:text-slate-300 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6">
        <div className="w-full max-w-4xl mx-auto">
          {!gameEnded ? (
            <>
              {/* Stats Bar */}
              <div className="flex items-center justify-center gap-8 mb-12 text-yellow-400">
                <div className="text-center">
                  <div className="text-3xl font-bold">{timeLeft}</div>
                  <div className="text-sm text-slate-500">time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.wpm}</div>
                  <div className="text-sm text-slate-500">wpm</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.accuracy}%</div>
                  <div className="text-sm text-slate-500">acc</div>
                </div>
              </div>

              {/* Typing Area */}
              <div className="relative mb-8">
                <div className="p-8 rounded-lg bg-transparent">
                  {renderWords()}
                </div>

                {/* Hidden Input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={typedText}
                  onChange={handleInputChange}
                  className="absolute opacity-0 pointer-events-none"
                  autoFocus
                  disabled={gameEnded}
                />
              </div>

              {/* Players List */}
              <div className="flex justify-center">
                <div className="bg-slate-800/50 rounded-lg p-4 min-w-[300px]">
                  <div className="text-center text-slate-400 text-sm mb-3">live wpm</div>
                  <div className="space-y-2">
                    {currentRoom.players
                      .sort((a, b) => b.wpm - a.wpm)
                      .map((player, index) => (
                        <div
                          key={player.id}
                          className={`flex items-center justify-between px-3 py-2 rounded ${
                            player.id === user?.id 
                              ? 'bg-yellow-400/10 text-yellow-400' 
                              : 'text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-mono">
                              #{index + 1}
                            </span>
                            <span className="text-sm">{player.username}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span>{player.wpm} wpm</span>
                            <span className="text-slate-500">{player.accuracy}%</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Results Screen */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-yellow-400">race complete</h2>
                <div className="text-slate-400">final results</div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-8 max-w-2xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold text-yellow-400">{stats.wpm}</div>
                    <div className="text-sm text-slate-500">wpm</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-400">{stats.accuracy}%</div>
                    <div className="text-sm text-slate-500">accuracy</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-400">{typedText.length}</div>
                    <div className="text-sm text-slate-500">characters</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-400">{stats.errors}</div>
                    <div className="text-sm text-slate-500">errors</div>
                  </div>
                </div>
              </div>

              {/* Final Leaderboard */}
              <div className="bg-slate-800/50 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-center text-slate-400 text-sm mb-4">final standings</div>
                <div className="space-y-3">
                  {currentRoom.players
                    .sort((a, b) => b.wpm - a.wpm)
                    .map((player, index) => (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between px-4 py-3 rounded ${
                          player.id === user?.id 
                            ? 'bg-yellow-400/10 text-yellow-400' 
                            : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-500 text-black' : 
                            index === 1 ? 'bg-slate-400 text-black' :
                            index === 2 ? 'bg-orange-500 text-black' : 'bg-slate-600 text-slate-300'
                          }`}>
                            {index + 1}
                          </div>
                          <span>{player.username}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{player.wpm} wpm</div>
                          <div className="text-xs text-slate-500">{player.accuracy}% acc</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="text-slate-500 text-sm">
                returning to lobby in a few seconds...
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom hint */}
      {!gameStarted && !gameEnded && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="text-slate-500 text-sm">
            click here or start typing to focus
          </div>
        </div>
      )}
    </div>
  );
};