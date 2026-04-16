const Mission = require('../models/Mission');
const User = require('../models/User');
const geminiService = require('../services/geminiService');

// פונקציה לשליפת משימה ויצירת השיעור דרך AI (GET)
// Protected by isVerified
const getMissionLesson = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        
        // 1. מחפשים את המשימה במסד הנתונים
        const mission = await Mission.findOne({ missionId: id });
        
        if (!mission) {
            return res.status(404).json({ success: false, error: "Mission not found in DB" });
        }

        // 2. Sort req.user.sandbox by score (ascending) and pick the top 2 words (the user's weakest words)
        const pastWeakWords = [...user.sandbox]
            .sort((a, b) => a.score - b.score)
            .slice(0, 2);

        // 3. שולחים את נתוני המשימה ל-Gemini לייצור התוכן
        const lessonContent = await geminiService.generateMissionContent(mission, pastWeakWords, 'Spanish', 'Hebrew');

        // 4. מחזירים את התשובה ללקוח
        res.json({
            success: true,
            missionData: {
                id: mission.missionId,
                level: mission.level,
                grammarRule: mission.grammarRule,
                order: mission.order
            },
            lesson: lessonContent
        });

    } catch (error) {
        console.error("Error in getMissionLesson:", error);
        res.status(500).json({ success: false, error: "Server error generating lesson" });
    }
};

// פונקציית עזר ליצירת משימה חדשה ב-DB (POST)
// Public/Admin as requested
const createMission = async (req, res) => {
    try {
        const newMission = new Mission(req.body);
        await newMission.save();
        res.status(201).json({ success: true, data: newMission });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// POST /complete (Protected by isVerified)
const completeMission = async (req, res) => {
    try {
        const { missionId } = req.body;
        const userId = req.user._id;

        // 1. מוצאים את המשימה
        const mission = await Mission.findOne({ missionId });
        if (!mission) return res.status(404).json({ message: "Mission not found" });

        // 2. מוצאים את המשתמש
        const user = await User.findById(userId);

        // 3. לוקחים את כל הפעלים ושמות העצם מהמשימה
        const requiredWords = [
            ...mission.requiredVerbs.map(w => ({ word: w, type: 'verb' })),
            ...mission.requiredNouns.map(w => ({ word: w, type: 'noun' }))
        ];

        // 4. מזריקים ל-Sandbox (רק אם המילה לא קיימת שם כבר)
        requiredWords.forEach(item => {
            const exists = user.sandbox.find(s => s.word === item.word);
            if (!exists) {
                user.sandbox.push({
                    word: item.word,
                    type: item.type,
                    score: 1 
                });
            }
        });

        // 5. מעדכנים את ההתקדמות במפה
        if (mission.order >= user.currentMissionOrder) {
            user.currentMissionOrder = user.currentMissionOrder + 1;
        }

        await user.save();
        res.json({ 
            success: true, 
            message: "Mission completed and Sandbox updated!", 
            currentMissionOrder: user.currentMissionOrder,
            sandbox: user.sandbox
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMissionLesson,
    createMission,
    completeMission
};