
import router from "express";
import {
  createGameRecord,
  getLeaderboard,
} from "../controller/game.controller.js";

const router = express.Router();

router.post("/result", createGameRecord);
router.get("/leaderboard", getLeaderboard);

export default router;
