const Vocabulary = require('../models/Vocabulary');
const GrammarRule = require('../models/GrammarRule');

// --- Vocabulary ---
const getVocabulary = async (req, res) => {
    try {
        const words = await Vocabulary.find().sort({ level: 1, word: 1 });
        res.json(words);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addVocabulary = async (req, res) => {
    try {
        const newWord = new Vocabulary(req.body);
        await newWord.save();
        res.status(201).json(newWord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// --- Grammar Rules ---
const getRules = async (req, res) => {
    try {
        const rules = await GrammarRule.find();
        res.json(rules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addRule = async (req, res) => {
    try {
        const newRule = new GrammarRule(req.body);
        await newRule.save();
        res.status(201).json(newRule);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteVocabulary = async (req, res) => {
    try {
        const { id } = req.params;
        await Vocabulary.findByIdAndDelete(id);
        res.json({ success: true, message: "Word deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete word", error: error.message });
    }
};

const deleteRule = async (req, res) => {
    try {
        await GrammarRule.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete rule", error: error.message });
    }
};
// אל תשכח להוסיף את deleteRule לייצוא למטה (module.exports) ולחבר ב-routes/admin.js!

module.exports = {
    getVocabulary, addVocabulary, getRules, addRule, deleteVocabulary, deleteRule
};