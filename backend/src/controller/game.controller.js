
const gameHistory = [];

export const createGameRecord = (req, res) => {
  const { username, wpm, accuracy } = req.body;

  if (!username || !wpm || !accuracy) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const result = {
    username,
    wpm,
    accuracy,
    date: new Date().toISOString(),
  };

  gameHistory.push(result);
  return res.status(201).json({ message: "Result saved", result });
};

export const getLeaderboard = (req, res) => {
  const top10 = [...gameHistory]
    .sort((a, b) => b.wpm - a.wpm)
    .slice(0, 10);
  return res.status(200).json(top10);
};
