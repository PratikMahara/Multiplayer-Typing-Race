import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Zap,
  Target,
  RotateCcw,
  Settings,
  Trophy,
  ArrowLeft,
} from "lucide-react";
import { TypingStats } from "../../types";

interface PracticeTypingTestProps {
  onBack: () => void;
}

const practiceTexts = {
  easy: [
    "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet and is perfect for beginners to practice their typing skills.",
    "Practice makes perfect when it comes to typing. Start slowly and focus on accuracy rather than speed. Your fingers will naturally become faster over time.",
    "Learning to type without looking at the keyboard is called touch typing. It takes time to develop this skill but it will make you much more efficient.",
  ],
  medium: [
    "Technology has revolutionized the way we communicate, work, and live our daily lives. From smartphones to artificial intelligence, these innovations continue to shape our future in remarkable ways that we could never have imagined just a few decades ago.",
    "The art of programming requires not only technical knowledge but also creative problem-solving skills. Developers must think logically, break down complex problems into smaller components, and write clean, maintainable code that others can understand.",
    "Climate change represents one of the most significant challenges facing humanity today. Scientists around the world are working tirelessly to develop sustainable solutions and renewable energy technologies to combat this global crisis.",
  ],
  hard: [
    "Quantum computing represents a paradigm shift in computational capabilities, leveraging the principles of quantum mechanics to process information in ways that classical computers cannot. These machines utilize quantum bits, or qubits, which can exist in multiple states simultaneously through superposition, enabling exponentially faster calculations for specific types of problems.",
    "The philosophical implications of artificial intelligence extend far beyond mere technological advancement, raising fundamental questions about consciousness, free will, and the nature of human intelligence itself. As we develop increasingly sophisticated AI systems, we must grapple with ethical considerations regarding their integration into society.",
    "Cryptocurrency and blockchain technology have disrupted traditional financial systems by introducing decentralized, peer-to-peer transactions that operate independently of central banking authorities. This revolutionary approach to digital currency has sparked debates about monetary policy, financial sovereignty, and the future of economic systems worldwide.",
  ],
};

export const PracticeTypingTest: React.FC<PracticeTypingTestProps> = ({
  onBack,
}) => {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [currentText, setCurrentText] = useState("");
  const [typedText, setTypedText] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [duration, setDuration] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 100,
    currentWordIndex: 0,
    typedText: "",
    errors: 0,
    startTime: 0,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const selectRandomText = useCallback(() => {
    const texts = practiceTexts[difficulty];
    const randomIndex = Math.floor(Math.random() * texts.length);
    setCurrentText(texts[randomIndex]);
  }, [difficulty]);

  const calculateStats = useCallback(
    (typed: string, startTime: number): TypingStats => {
      const currentTime = Date.now();
      const timeElapsed = (currentTime - startTime) / 1000 / 60; // in minutes

      const totalChars = typed.length;
      const correctChars = typed.split("").filter((char, index) => {
        return char === currentText[index];
      }).length;

      const errors = totalChars - correctChars;
      const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 100;
      const wpm = timeElapsed > 0 ? correctChars / 5 / timeElapsed : 0;

      const words = currentText.substring(0, totalChars).split(" ");
      const currentWordIndex = Math.max(0, words.length - 1);

      return {
        wpm: Math.round(wpm),
        accuracy: Math.round(accuracy * 10) / 10,
        currentWordIndex,
        typedText: typed,
        errors,
        startTime,
      };
    },
    [currentText]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameEnded) return;

    const value = e.target.value;

    // Prevent typing beyond the text length
    if (value.length > currentText.length) return;

    setTypedText(value);

    if (!gameStarted && value.length > 0) {
      setGameStarted(true);
      setStats((prev) => ({ ...prev, startTime: Date.now() }));
    }

    if (gameStarted) {
      const newStats = calculateStats(value, stats.startTime);
      setStats(newStats);
    }

    // Check if text is completed
    if (value === currentText) {
      setGameEnded(true);
    }
  };

  const resetGame = () => {
    setTypedText("");
    setGameStarted(false);
    setGameEnded(false);
    setTimeLeft(duration);
    setStats({
      wpm: 0,
      accuracy: 100,
      currentWordIndex: 0,
      typedText: "",
      errors: 0,
      startTime: 0,
    });
    selectRandomText();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const renderText = () => {
    if (!currentText) return null;

    return (
      <div className="text-2xl leading-relaxed font-mono">
        {currentText.split("").map((char, index) => {
          let className = "transition-colors duration-75";

          if (index < typedText.length) {
            if (typedText[index] === char) {
              className += " text-green-400 bg-green-400/10";
            } else {
              className += " text-red-400 bg-red-400/20";
            }
          } else if (index === typedText.length && !gameEnded) {
            className += " text-white bg-blue-500 animate-pulse"; // cursor
          } else {
            className += " text-slate-500";
          }

          return (
            <span key={index} className={className}>
              {char === " " ? "\u00A0" : char}
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
        setTimeLeft((prev) => {
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

  const progress = currentText
    ? (typedText.length / currentText.length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Lobby
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Practice Typing
                  </h1>
                  <p className="text-slate-400 text-sm">Improve your skills</p>
                </div>
              </div>
            </div>

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
                  <p className="text-2xl font-bold text-white">
                    {stats.accuracy}%
                  </p>
                  <p className="text-slate-400 text-sm">Accuracy</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={resetGame}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 text-sm">Progress</span>
              <span className="text-white text-sm">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 w-full z-50 bg-slate-800/90 backdrop-blur-sm border-b border-slate-700/50"
          >
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6">
                  {/* Difficulty Selector */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) =>
                        setDifficulty(
                          e.target.value as "easy" | "medium" | "hard"
                        )
                      }
                      className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  {/* Duration Selector */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Duration (seconds)
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => {
                        const newDuration = parseInt(e.target.value);
                        setDuration(newDuration);
                        setTimeLeft(newDuration);
                      }}
                      className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value={30}>30s</option>
                      <option value={60}>60s</option>
                      <option value={120}>2 min</option>
                      <option value={300}>5 min</option>
                    </select>
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  onClick={resetGame}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Apply & Reset
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 max-w-6xl mx-auto w-full">
  {/* Rendered Typing Text */}
<div className="mb-6 break-words whitespace-pre-wrap text-slate-300 text-lg w-full">
  {renderText()}
</div>

  {/* Hidden Input */}
  <input
    ref={inputRef}
    type="text"
    value={typedText}
    onChange={handleInputChange}
    className="absolute w-0 h-0 opacity-0 pointer-events-none"
    autoFocus
    disabled={gameEnded}
    tabIndex={-1}
    aria-hidden="true"
  />

  {/* Game Prompt */}
  <div className="text-center">
    <p className="text-slate-300">
      {gameStarted ? "Keep typing!" : "Start typing to begin..."}
    </p>
    <p className="text-slate-500 text-sm mt-2">
      Difficulty:{" "}
      <span className="capitalize text-slate-400">{difficulty}</span>
    </p>
  </div>

  {/* Stats Panel */}
  <div className="mt-6 grid grid-cols-2 gap-4 text-center text-slate-400">
    <div>
      <div className="text-2xl font-bold">{stats.wpm}</div>
      <div className="text-xs">WPM</div>
    </div>
    <div>
      <div className="text-2xl font-bold">{stats.accuracy}%</div>
      <div className="text-xs">Accuracy</div>
    </div>
    <div>
      <div className="text-2xl font-bold">{typedText.length}</div>
      <div className="text-xs">Characters</div>
    </div>
    <div>
      <div className="text-2xl font-bold">{stats.errors}</div>
      <div className="text-xs">Errors</div>
    </div>
  </div>
</div>


              {/* Live Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.wpm}</p>
                  <p className="text-slate-400 text-sm">Words per Minute</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {stats.accuracy}%
                  </p>
                  <p className="text-slate-400 text-sm">Accuracy</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">{stats.errors}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {stats.errors}
                  </p>
                  <p className="text-slate-400 text-sm">Errors</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white">
                Practice Complete!
              </h2>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 max-w-2xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <p className="text-3xl font-bold text-purple-400">
                      {stats.wpm}
                    </p>
                    <p className="text-slate-400">WPM</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-400">
                      {stats.accuracy}%
                    </p>
                    <p className="text-slate-400">Accuracy</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-blue-400">
                      {typedText.length}
                    </p>
                    <p className="text-slate-400">Characters</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-red-400">
                      {stats.errors}
                    </p>
                    <p className="text-slate-400">Errors</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <motion.button
                  onClick={resetGame}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Try Again
                </motion.button>
                <motion.button
                  onClick={onBack}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Back to Lobby
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
