const Vocabulary = require('../models/Vocabulary');
const UserProgress = require('../models/UserProgress');

const addWordToSandbox = async (req, res) => {
    try {
        const { word, translation, language } = req.body;
        const userId = req.user._id;

        if (!word || !translation || !language) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        // 1. שולפים את פרופיל ההתקדמות של המשתמש
        let progress = await UserProgress.findOne({ userId, language });
        if (!progress) {
            progress = new UserProgress({ userId, language, sandbox: [] });
        }

        // 2. בודקים אם המילה במקרה כבר קיימת במילון הגלובלי (כדי לחסוך מקום)
        const existingGlobalWord = await Vocabulary.findOne({ word: word.toLowerCase(), language });

        // 3. מוודאים שהמילה לא קיימת כבר בארגז החול (מונע כפילויות)
        const isDuplicate = progress.sandbox.find(s => 
            (existingGlobalWord && s.vocabularyId?.toString() === existingGlobalWord._id.toString()) || 
            (s.word && s.word.toLowerCase() === word.toLowerCase())
        );

        if (isDuplicate) {
            return res.status(200).json({ message: "Word is already in your sandbox." });
        }

        // 4. מוסיפים לארגז החול
        const newSandboxItem = {
            score: 0,
            lastPracticed: Date.now()
        };

        if (existingGlobalWord) {
            // המילה גלובלית - שומרים רק רפרנס
            newSandboxItem.vocabularyId = existingGlobalWord._id;
        } else {
            // המילה פרטית וחדשה - שומרים טקסט בלבד! בלי לגעת במילון הכללי
            newSandboxItem.word = word.toLowerCase();
            newSandboxItem.translation = translation;
        }

        progress.sandbox.push(newSandboxItem);
        await progress.save();

        res.status(201).json({ message: "Added to personal sandbox successfully!" });

    } catch (error) {
        console.error("Sandbox Add Error:", error);
        res.status(500).json({ message: "Failed to add word to sandbox", error: error.message });
    }
};

// GET /api/users/progress
const getUserProgress = async (req, res) => {
    try {
        const lang = req.query.lang;
        const userId = req.user._id;

        // שולפים את ההתקדמות ומבקשים מ-Mongoose להביא את המילים המלאות מהמילון הכללי
        const progress = await UserProgress.findOne({ userId, language: lang })
            .populate('sandbox.vocabularyId', 'word translation'); 

        // אם אין התקדמות, נחזיר ארגז חול ריק כדי שה-React לא יקרוס
        res.json({ progress: progress || { sandbox: [] } });
    } catch (error) {
        console.error("Error fetching progress:", error);
        res.status(500).json({ message: "Failed to fetch progress" });
    }
};

// PUT /api/users/sandbox/update
const updateSandboxScores = async (req, res) => {
    try {
        const { language, results } = req.body; 
        // results יהיה מערך בסגנון: [{ wordId: "...", isCorrect: true }, ...]
        const userId = req.user._id;

        const progress = await UserProgress.findOne({ userId, language });
        if (!progress) return res.status(404).json({ message: "Progress not found" });

        // עוברים על התוצאות מהמשחק ומעדכנים את הניקוד
        results.forEach(result => {
            const sandboxItem = progress.sandbox.find(
                item => (item.vocabularyId && item.vocabularyId.toString() === result.wordId) || 
                        (item._id && item._id.toString() === result.wordId)
            );

            if (sandboxItem) {
                if (result.isCorrect) {
                    sandboxItem.score += 1; // העלאת דרגת קושי (לדחות את החזרה הבאה)
                } else {
                    sandboxItem.score = Math.max(0, sandboxItem.score - 1); // טעות מחזירה אחורה
                }
                sandboxItem.lastPracticed = Date.now();
            }
        });

        await progress.save();
        res.json({ message: "Scores updated successfully", sandbox: progress.sandbox });

    } catch (error) {
        console.error("Error updating scores:", error);
        res.status(500).json({ message: "Failed to update scores" });
    }
};

module.exports = {
    addWordToSandbox, getUserProgress, updateSandboxScores
};