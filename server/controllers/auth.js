const User = require('../models/User');
const jwt = require('jsonwebtoken');

// פונקציית עזר ליצירת Token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// --- הרשמה ---
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'משתמש כבר קיים במערכת' });

        const user = await User.create({ username, email, password });

        res.status(201).json({
            success: true,
            token: createToken(user._id),
            user: { id: user._id, username, email }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- התחברות ---
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'אימייל או סיסמה שגויים' });
        }

        res.json({
            success: true,
            token: createToken(user._id),
            user: { id: user._id, username: user.username, email }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = {register, login};