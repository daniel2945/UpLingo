const express = require("express");
const userRouter = express.Router();
const { getMe } = require("../controllers/user");
const { 
    getUserProgress, 
    addWordToSandbox, 
    updateSandboxScores, 
    completeMission // ייבוא הפונקציה החדשה מהקונטרולר
} = require("../controllers/userProgress");
const { verifyToken } = require("../middleware/auth");

// GET /api/users/me (Protected)
userRouter.get("/me", verifyToken, getMe);

// Progress and Map Routes
userRouter.get("/progress", verifyToken, getUserProgress);
userRouter.put("/progress/complete", verifyToken, completeMission); // הנתיב החדש לסיום שיעור והתקדמות במפה!

// Sandbox Routes
userRouter.post("/sandbox/add", verifyToken, addWordToSandbox);
userRouter.put("/sandbox/update", verifyToken, updateSandboxScores);

module.exports = userRouter;