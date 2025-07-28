import Router from "express";
import { googleLogin } from "../controller/user.controller.js";
const router = Router();

router.route("/login").post(googleLogin);
export default router;
