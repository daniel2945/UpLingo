const express = require("express");
const userRouter = express.Router();
const { getMe } = require("../controllers/user");
const { getUserProgress, addWordToSandbox, updateSandboxScores } = require("../controllers/userProgress");
const { verifyToken } = require("../middleware/auth");

// GET /api/users/me (Protected)
userRouter.get("/me", verifyToken, getMe);
userRouter.get("/progress", verifyToken, getUserProgress);
userRouter.post("/sandbox/add", verifyToken, addWordToSandbox);
userRouter.put('/sandbox/update', verifyToken, updateSandboxScores);
module.exports = userRouter;
