import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { useGame } from '../../context/GameContext';

interface JoinRoomModalProps {
  onClose: () => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ onClose }) => {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { joinRoom } = useGame();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      await joinRoom(roomCode.toUpperCase().trim());
      onClose();
    } catch (error) {
      setError('Room not found or is full');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            Join Room
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-2xl font-mono tracking-wider"
              placeholder="ABCDEF"
              required
              maxLength={6}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <div className="bg-slate-700/30 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">How to Join</h3>
            <ul className="space-y-1 text-sm text-slate-400">
              <li>• Ask the host for the room code</li>
              <li>• Enter the 6-character code above</li>
              <li>• Wait for other players to join</li>
              <li>• Get ready to race!</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={loading || !roomCode.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Joining...
                </div>
              ) : (
                'Join Room'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};