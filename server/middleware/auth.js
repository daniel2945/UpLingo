const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }
            return next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const verifyAdmin = (req, res, next) => {
    // אנחנו מניחים ש-verifyToken כבר רץ לפני הפונקציה הזו
    // ולכן req.user קיים ומכיל את פרטי המשתמש
    if (req.user && req.user.role === 'admin') {
        next(); // הכל תקין, תמשיך לקונטרולר!
    } else {
        res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
};

module.exports = { verifyToken, verifyAdmin };