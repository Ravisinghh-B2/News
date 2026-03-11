const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Save a news article
// @route   POST /api/v1/users/save
exports.saveNews = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const { title, description, url, imageUrl, source, publishedAt } = req.body;

        // Check if already saved
        const exists = user.savedArticles.find(a => a.url === url);
        if (exists) {
            return res.status(400).json({ message: 'Article already saved' });
        }

        user.savedArticles.push({
            title,
            description,
            url,
            imageUrl,
            source,
            publishedAt: new Date(publishedAt)
        });

        await user.save();
        res.status(201).json({ message: 'Article saved successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all saved news articles
// @route   GET /api/v1/users/saved
exports.getSavedNews = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user.savedArticles);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a saved news article
// @route   DELETE /api/v1/users/saved/:id
exports.deleteSavedNews = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        user.savedArticles = user.savedArticles.filter(a => a._id.toString() !== req.params.id);
        await user.save();
        res.json({ message: 'Article removed from saved items' });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, username, email } = req.body;
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = name || user.name;
            user.username = username || user.username;
            user.email = email || user.email;

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                username: updatedUser.username,
                email: updatedUser.email
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Change user password
// @route   PUT /api/v1/users/change-password
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user interests
// @route   PUT /api/v1/users/interests
exports.updateInterests = async (req, res, next) => {
    try {
        const { interests } = req.body;
        if (!Array.isArray(interests)) {
            return res.status(400).json({ message: 'Interests must be an array' });
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.interests = interests;
        await user.save();
        res.json({ message: 'Interests updated successfully', interests: user.interests });
    } catch (error) {
        next(error);
    }
};
