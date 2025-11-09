const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Middleware xác thực JWT
exports.protect = async (req, res, next) => {
    try {
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "Not authorized to access this route" 
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId);
            
            if (!req.user) {
                return res.status(401).json({ 
                    success: false, 
                    message: "User not found" 
                });
            }
            
            next();
        } catch (error) {
            return res.status(401).json({ 
                success: false, 
                message: "Not authorized to access this route" 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Middleware kiểm tra quyền Admin
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

// Xem profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            success: true,
            user: {
                _id: user._id,
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Cập nhật profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, password } = req.body;
        const updateData = {};

        if (name) updateData.name = name.trim();
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Password must be at least 6 characters" 
                });
            }
            updateData.password = password;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

