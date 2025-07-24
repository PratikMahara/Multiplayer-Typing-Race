import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameRoom, Player, GameResult } from '../types';
import { useAuth } from './AuthContext';

interface GameContextType {
  currentRoom: GameRoom | null;
  joinRoom: (roomCode: string) => Promise<void>;
  createRoom: (roomName: string) => Promise<void>;
  leaveRoom: () => void;
  setReady: (ready: boolean) => void;
  updateProgress: (progress: number, wpm: number, accuracy: number) => void;
  gameResults: GameResult[] | null;
  connected: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [gameResults, setGameResults] = useState<GameResult[] | null>(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  // Mock typing text paragraphs
  const mockTexts = [
    "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once, making it perfect for typing practice and testing keyboard layouts.",
    "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat.",
    "Technology has revolutionized the way we communicate, work, and live our daily lives. From smartphones to artificial intelligence, these innovations continue to shape our future in remarkable ways.",
    "The art of typing quickly and accurately requires practice, patience, and proper finger placement. Regular practice sessions can significantly improve your words per minute and reduce typing errors over time."
  ];

  useEffect(() => {
    // Simulate WebSocket connection
    setConnected(true);
    
    return () => {
      setConnected(false);
    };
  }, []);

  const createRoom = async (roomName: string): Promise<void> => {
    if (!user) return;

    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const mockRoom: GameRoom = {
      id: Date.now().toString(),
      name: roomName,
      code: roomCode,
      players: [{
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        isReady: false,
        progress: 0,
        wpm: 0,
        accuracy: 100,
        currentWordIndex: 0,
        typedText: '',
        errors: 0,
        isHost: true
      }],
      maxPlayers: 4,
      status: 'waiting',
      text: mockTexts[Math.floor(Math.random() * mockTexts.length)],
      duration: 60,
      createdAt: new Date()
    };

    setCurrentRoom(mockRoom);
    setGameResults(null);
  };

  const joinRoom = async (roomCode: string): Promise<void> => {
    if (!user) return;

    // Mock finding and joining room
    const mockRoom: GameRoom = {
      id: Date.now().toString(),
      name: `Room ${roomCode}`,
      code: roomCode,
      players: [
        {
          id: 'host-player',
          username: 'TypeMaster',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=typemaster',
          isReady: true,
          progress: 0,
          wpm: 0,
          accuracy: 100,
          currentWordIndex: 0,
          typedText: '',
          errors: 0,
          isHost: true
        },
        {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
          isReady: false,
          progress: 0,
          wpm: 0,
          accuracy: 100,
          currentWordIndex: 0,
          typedText: '',
          errors: 0,
          isHost: false
        }
      ],
      maxPlayers: 4,
      status: 'waiting',
      text: mockTexts[Math.floor(Math.random() * mockTexts.length)],
      duration: 60,
      createdAt: new Date()
    };

    setCurrentRoom(mockRoom);
    setGameResults(null);
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
    setGameResults(null);
  };

  const setReady = (ready: boolean) => {
    if (!currentRoom || !user) return;

    const updatedRoom = { ...currentRoom };
    const playerIndex = updatedRoom.players.findIndex(p => p.id === user.id);
    
    if (playerIndex !== -1) {
      updatedRoom.players[playerIndex].isReady = ready;
      setCurrentRoom(updatedRoom);
    }
  };

  const updateProgress = (progress: number, wpm: number, accuracy: number) => {
    if (!currentRoom || !user) return;

    const updatedRoom = { ...currentRoom };
    const playerIndex = updatedRoom.players.findIndex(p => p.id === user.id);
    
    if (playerIndex !== -1) {
      updatedRoom.players[playerIndex].progress = progress;
      updatedRoom.players[playerIndex].wpm = wpm;
      updatedRoom.players[playerIndex].accuracy = accuracy;
      setCurrentRoom(updatedRoom);
    }
  };

  const value: GameContextType = {
    currentRoom,
    joinRoom,
    createRoom,
    leaveRoom,
    setReady,
    updateProgress,
    gameResults,
    connected
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};