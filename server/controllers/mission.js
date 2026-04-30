const Mission = require('../models/Mission');
const UserProgress = require('../models/UserProgress');

// פונקציה חדשה: שליפת כל המשימות (בשביל לצייר את המפה ב-Dashboard)
const getAllMissions = async (req, res) => {
    try {
        const { lang } = req.query;
        // שולפים רק משימות מפורסמות בשפה המבוקשת (בלי הכרטיסיות עצמן כדי לחסוך תעבורה)
        const missions = await Mission.find({ language: lang, isPublished: true }).select('-cards');
        res.json(missions);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch missions for map" });
    }
};

// טעינת שיעור ספציפי כשהמשתמש לוחץ עליו + חסימת אבטחה בשרת
const getMissionLesson = async (req, res) => {
    try {
        const { id } = req.params; 
        const { lang } = req.query; 
        const userId = req.user._id; // יש לנו את ה-ID של המשתמש מה-Token דרך ה-middleware

        // 1. קודם שולפים את המשימה המבוקשת
        const mission = await Mission.findOne({ 
            _id: id, 
            language: lang, 
            isPublished: true 
        });
        
        if (!mission) {
            return res.status(404).json({ message: "Mission not found for this language." });
        }

        // 2. שולפים את ההתקדמות האמיתית של המשתמש ממסד הנתונים
        let progress = await UserProgress.findOne({ userId, language: lang });
        const currentMissionOrder = progress ? progress.currentMissionOrder : 1;

        // 3. השומר בשרת: אם השיעור מתקדם יותר ממה שהמשתמש הגיע אליו - חוסמים!
        if (mission.missionOrder > currentMissionOrder) {
            return res.status(403).json({ 
                error: "Forbidden",
                message: "Nice try! This mission is still locked. Complete previous missions first." 
            });
        }
        
        // 4. רק אם הכל תקין והוא רשאי - מחזירים לו את תוכן השיעור
        res.json(mission);
    } catch (error) {
        res.status(500).json({ error: "Server error retrieving mission" });
    }
};


// סיום שיעור (הקוד שלך שהיה מצוין, נשאר אותו דבר)
const completeMission = async (req, res) => {
    try {
        const { missionOrder, language } = req.body;
        const userId = req.user._id;

        const mission = await Mission.findOne({ missionOrder, language }).populate('targetVocabularyRefs');
        if (!mission) return res.status(404).json({ message: "Mission not found" });

        let progress = await UserProgress.findOne({ userId, language });
        if (!progress) {
            progress = new UserProgress({ userId, language, currentMissionOrder: 1, sandbox: [] });
        }

        if (mission.targetVocabularyRefs && mission.targetVocabularyRefs.length > 0) {
            mission.targetVocabularyRefs.forEach(vocabObj => {
                const exists = progress.sandbox.find(s => s.vocabularyId && s.vocabularyId.toString() === vocabObj._id.toString());
                if (!exists) {
                    progress.sandbox.push({
                        vocabularyId: vocabObj._id,
                        score: 1 
                    });
                }
            });
        }

        // קידום המשתמש רק אם הוא באמת היה בשיעור שהוא צריך לעבור
        if (mission.missionOrder >= progress.currentMissionOrder) {
            progress.currentMissionOrder = progress.currentMissionOrder + 1;
        }

        await progress.save();
        
        res.json({ 
            success: true, 
            message: "Progress saved!", 
            currentMissionOrder: progress.currentMissionOrder,
            sandbox: progress.sandbox
        });

    } catch (error) {
        console.error("Complete Mission Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllMissions,
    getMissionLesson,
    completeMission
};