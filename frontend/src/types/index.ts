export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  totalGames: number;
  bestWPM: number;
  averageAccuracy: number;
}

export interface GameRoom {
  id: string;
  name: string;
  code: string;
  players: Player[];
  maxPlayers: number;
  status: 'waiting' | 'starting' | 'playing' | 'finished';
  text: string;
  duration: number;
  createdAt: Date;
}

export interface Player {
  id: string;
  username: string;
  avatar?: string;
  isReady: boolean;
  progress: number;
  wpm: number;
  accuracy: number;
  currentWordIndex: number;
  typedText: string;
  errors: number;
  isHost: boolean;
}

export interface GameResult {
  playerId: string;
  username: string;
  wpm: number;
  accuracy: number;
  totalChars: number;
  correctChars: number;
  incorrectChars: number;
  timeElapsed: number;
  placement: number;
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  currentWordIndex: number;
  typedText: string;
  errors: number;
  startTime: number;
  endTime?: number;
}