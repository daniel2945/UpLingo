const User = require('../models/User');

// GET /api/users/me (Protected by isVerified)
const getMe = async (req, res) => {
    try {
        // req.user already attached by isVerified middleware
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                currentMissionOrder: user.currentMissionOrder,
                sandbox: user.sandbox
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getMe
};