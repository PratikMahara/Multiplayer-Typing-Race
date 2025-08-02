// utils/generateRoomCode.js
export default function generateRoomCode(length = 6) {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}
