import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Settings, ArrowLeft } from 'lucide-react';
import { TypingStats } from '../../types';

interface PracticeTypingTestProps {
  onBack: () => void;
}

const practiceTexts = {
  easy: [
    "the quick brown fox jumps over the lazy dog this sentence contains every letter of the alphabet and is perfect for beginners to practice their typing skills",
    "practice makes perfect when it comes to typing start slowly and focus on accuracy rather than speed your fingers will naturally become faster over time",
    "learning to type without looking at the keyboard is called touch typing it takes time to develop this skill but it will make you much more efficient"
  ],
  medium: [
    "technology has revolutionized the way we communicate work and live our daily lives from smartphones to artificial intelligence these innovations continue to shape our future in remarkable ways",
    "the art of programming requires not only technical knowledge but also creative problem solving skills developers must think logically break down complex problems into smaller components",
    "climate change represents one of the most significant challenges facing humanity today scientists around the world are working tirelessly to develop sustainable solutions"
  ],
  hard: [
    "quantum computing represents a paradigm shift in computational capabilities leveraging the principles of quantum mechanics to process information in ways that classical computers cannot achieve",
    "the philosophical implications of artificial intelligence extend far beyond mere technological advancement raising fundamental questions about consciousness free will and the nature of human intelligence",
    "cryptocurrency and blockchain technology have disrupted traditional financial systems by introducing decentralized peer to peer transactions that operate independently of central banking authorities"
  ]
};

export const PracticeTypingTest: React.FC<PracticeTypingTestProps> = ({ onBack }) => {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [currentText, setCurrentText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [duration, setDuration] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 100,
    currentWordIndex: 0,
    typedText: '',
    errors: 0,
    startTime: 0,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const words = currentText.split(' ');

  const selectRandomText = useCallback(() => {
    const texts = practiceTexts[difficulty];
    const randomIndex = Math.floor(Math.random() * texts.length);
    setCurrentText(texts[randomIndex]);
  }, [difficulty]);

  const calculateStats = useCallback((typed: string, startTime: number): TypingStats => {
    const currentTime = Date.now();
    const timeElapsed = (currentTime - startTime) / 1000 / 60; // in minutes
    
    const totalChars = typed.length;
    const correctChars = typed.split('').filter((char, index) => {
      return char === currentText[index];
    }).length;
    
    const errors = totalChars - correctChars;
    const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 100;
    const wpm = timeElapsed > 0 ? (correctChars / 5) / timeElapsed : 0;

    const typedWords = typed.split(' ');
    const currentWordIndex = Math.max(0, typedWords.length - 1);

    return {
      wpm: Math.round(wpm),
      accuracy: Math.round(accuracy * 10) / 10,
      currentWordIndex,
      typedText: typed,
      errors,
      startTime,
    };
  }, [currentText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameEnded) return;
    
    const value = e.target.value;
    
    // Prevent typing beyond the text length
    if (value.length > currentText.length) return;
    
    setTypedText(value);

    if (!gameStarted && value.length > 0) {
      setGameStarted(true);
      setStats(prev => ({ ...prev, startTime: Date.now() }));
    }

    if (gameStarted) {
      const newStats = calculateStats(value, stats.startTime);
      setStats(newStats);
      setCurrentWordIndex(newStats.currentWordIndex);
    }

    // Check if text is completed
    if (value === currentText) {
      setGameEnded(true);
    }
  };

  const resetGame = () => {
    setTypedText('');
    setGameStarted(false);
    setGameEnded(false);
    setTimeLeft(duration);
    setCurrentWordIndex(0);
    setStats({
      wpm: 0,
      accuracy: 100,
      currentWordIndex: 0,
      typedText: '',
      errors: 0,
      startTime: 0,
    });
    selectRandomText();
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
    selectRandomText();
  }, [selectRandomText]);

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
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300">
      {/* Top Navigation */}
      <div className="flex items-center justify-between p-6 max-w-6xl mx-auto">
        <button
          onClick={onBack}
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
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="text-slate-400 hover:text-slate-300 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-slate-800 bg-slate-800/30"
          >
            <div className="max-w-6xl mx-auto px-6 py-4">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-400">time</span>
                  <div className="flex gap-2">
                    {[30, 60, 120].map((time) => (
                      <button
                        key={time}
                        onClick={() => {
                          setDuration(time);
                          setTimeLeft(time);
                        }}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          duration === time 
                            ? 'bg-yellow-400 text-black' 
                            : 'text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-400">difficulty</span>
                  <div className="flex gap-2">
                    {(['easy', 'medium', 'hard'] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          difficulty === diff 
                            ? 'bg-yellow-400 text-black' 
                            : 'text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={resetGame}
                  className="ml-auto px-4 py-2 bg-yellow-400 text-black rounded text-sm hover:bg-yellow-300 transition-colors"
                >
                  apply & restart
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

              {/* Progress indicator */}
              <div className="flex justify-center">
                <div className="text-slate-500 text-sm">
                  {Math.round((typedText.length / currentText.length) * 100)}% complete
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
                <h2 className="text-4xl font-bold text-yellow-400">test complete</h2>
                <div className="text-slate-400">your results</div>
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

              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-yellow-400 text-black rounded hover:bg-yellow-300 transition-colors"
                >
                  try again
                </button>
                <button
                  onClick={onBack}
                  className="px-6 py-3 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
                >
                  back to lobby
                </button>
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