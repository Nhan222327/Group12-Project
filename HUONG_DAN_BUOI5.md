# 📚 HƯỚNG DẪN CHI TIẾT - BUỔI 5: Authentication & User Management

## 📋 MỤC LỤC
1. [Chuẩn bị môi trường](#1-chuẩn-bị-môi-trường)
2. [Hoạt động 1: Authentication cơ bản](#2-hoạt-động-1-authentication-cơ-bản)
3. [Hoạt động 2: Quản lý thông tin cá nhân](#3-hoạt-động-2-quản-lý-thông-tin-cá-nhân)
4. [Hoạt động 3: Quản lý User (Admin)](#4-hoạt-động-3-quản-lý-user-admin)
5. [Hoạt động 4: Tính năng nâng cao](#5-hoạt-động-4-tính-năng-nâng-cao)
6. [Hoạt động 5: Git Workflow](#6-hoạt-động-5-git-workflow)

---

## 1. CHUẨN BỊ MÔI TRƯỜNG

### 1.1. Cài đặt Dependencies

#### Backend (cd vào `backend/`)
```bash
npm install bcryptjs jsonwebtoken dotenv nodemailer multer cloudinary
```

#### Frontend (cd vào `frontend/`)
```bash
npm install react-router-dom
```

### 1.2. Tạo file `.env` trong `backend/`
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/group12-auth
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=7d
RESET_PASSWORD_EXPIRE=3600000
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

## 2. HOẠT ĐỘNG 1: AUTHENTICATION CƠ BẢN

### 2.1. Sinh viên 3 - Database: Cập nhật Schema User

**File: `backend/models/User.js`**

```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Name is required"],
        trim: true
    },
    email: { 
        type: String, 
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false // Không trả về password khi query
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    avatar: {
        type: String,
        default: ""
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password trước khi lưu
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method để so sánh password
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
```

### 2.2. Sinh viên 1 - Backend: Tạo Auth Controller

**Tạo file: `backend/controllers/authController.js`**

```javascript
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Tạo JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "7d"
    });
};

// Đăng ký
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide name, email and password" 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: "Password must be at least 6 characters" 
            });
        }

        // Kiểm tra email trùng
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: "Email already exists" 
            });
        }

        // Tạo user mới
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password
        });

        // Tạo token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: "Sign up successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Đăng nhập
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide email and password" 
            });
        }

        // Tìm user và include password (vì đã set select: false)
        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }

        // Kiểm tra password
        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }

        // Tạo token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: "Login successful",
            token,
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

// Đăng xuất (chủ yếu xử lý ở client, backend chỉ trả về success)
exports.logout = async (req, res) => {
    res.json({
        success: true,
        message: "Logout successful"
    });
};
```

### 2.3. Sinh viên 1 - Backend: Tạo Auth Routes

**Tạo file: `backend/routes/auth.js`**

```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;
```

### 2.4. Sinh viên 1 - Backend: Cập nhật server.js

**File: `backend/server.js`** - Thêm auth routes:

```javascript
// ... existing code ...
const authRoutes = require('./routes/auth');

// Routes
app.use('/api', userRoutes);
app.use('/api/auth', authRoutes); // Thêm dòng này

// ... rest of code ...
```

### 2.5. Sinh viên 2 - Frontend: Tạo Auth Context

**File: `frontend/src/context/AuthContext.jsx`**

```javascript
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Set token vào axios headers
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
            // Lấy thông tin user
            fetchProfile();
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
            setLoading(false);
        }
    }, [token]);

    const fetchProfile = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/users/profile');
            setUser(res.data.user);
        } catch (error) {
            console.error('Fetch profile error:', error);
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const signup = async (name, email, password) => {
        try {
            const res = await axios.post('http://localhost:3000/api/auth/signup', {
                name,
                email,
                password
            });
            setToken(res.data.token);
            setUser(res.data.user);
            return { success: true, message: res.data.message };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Sign up failed' 
            };
        }
    };

    const login = async (email, password) => {
        try {
            const res = await axios.post('http://localhost:3000/api/auth/login', {
                email,
                password
            });
            setToken(res.data.token);
            setUser(res.data.user);
            return { success: true, message: res.data.message };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:3000/api/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setToken(null);
            setUser(null);
        }
    };

    const value = {
        user,
        token,
        loading,
        signup,
        login,
        logout,
        isAuthenticated: !!token
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

### 2.6. Sinh viên 2 - Frontend: Tạo SignUp Component

**File: `frontend/src/components/auth/SignUp.jsx`**

```javascript
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        const result = await signup(formData.name, formData.email, formData.password);
        
        if (result.success) {
            alert(result.message);
            navigate('/profile');
        } else {
            alert(result.message);
        }
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="text"
                        placeholder="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                    {errors.name && <div style={{ color: 'red', fontSize: '14px' }}>{errors.name}</div>}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                    {errors.email && <div style={{ color: 'red', fontSize: '14px' }}>{errors.email}</div>}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                    {errors.password && <div style={{ color: 'red', fontSize: '14px' }}>{errors.password}</div>}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                    {errors.confirmPassword && <div style={{ color: 'red', fontSize: '14px' }}>{errors.confirmPassword}</div>}
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {loading ? 'Signing up...' : 'Sign Up'}
                </button>
            </form>
            <p style={{ marginTop: '15px', textAlign: 'center' }}>
                Already have an account? <a href="/login">Login</a>
            </p>
        </div>
    );
}
```

### 2.7. Sinh viên 2 - Frontend: Tạo Login Component

**File: `frontend/src/components/auth/Login.jsx`**

```javascript
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
            alert(result.message);
            navigate('/profile');
        } else {
            alert(result.message);
        }
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                    {errors.email && <div style={{ color: 'red', fontSize: '14px' }}>{errors.email}</div>}
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                    {errors.password && <div style={{ color: 'red', fontSize: '14px' }}>{errors.password}</div>}
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <p style={{ marginTop: '15px', textAlign: 'center' }}>
                Don't have an account? <a href="/signup">Sign Up</a>
            </p>
            <p style={{ marginTop: '10px', textAlign: 'center' }}>
                <a href="/forgot-password">Forgot Password?</a>
            </p>
        </div>
    );
}
```

### 2.8. Sinh viên 2 - Frontend: Cập nhật App.js với Router

**File: `frontend/src/App.js`**

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import UserList from './components/UserList';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) return <div>Loading...</div>;
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route 
                            path="/users" 
                            element={
                                <ProtectedRoute>
                                    <UserList />
                                </ProtectedRoute>
                            } 
                        />
                        <Route path="/" element={<Navigate to="/users" />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
```

---

## 3. HOẠT ĐỘNG 2: QUẢN LÝ THÔNG TIN CÁ NHÂN

### 3.1. Sinh viên 1 - Backend: Tạo Profile Controller

**Tạo file: `backend/controllers/profileController.js`**

```javascript
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

// Xem profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            success: true,
            user: {
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
        const { name, password, avatar } = req.body;
        const updateData = {};

        if (name) updateData.name = name.trim();
        if (avatar) updateData.avatar = avatar;
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
```

### 3.2. Sinh viên 1 - Backend: Tạo Profile Routes

**Tạo file: `backend/routes/profile.js`**

```javascript
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.get('/profile', profileController.protect, profileController.getProfile);
router.put('/users/profile', profileController.protect, profileController.updateProfile);

module.exports = router;
```

**Cập nhật `backend/server.js`:**

```javascript
const profileRoutes = require('./routes/profile');
app.use('/api', profileRoutes);
```

### 3.3. Sinh viên 2 - Frontend: Tạo Profile Component

**File: `frontend/src/components/profile/Profile.jsx`**

```javascript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Profile() {
    const { user, logout } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({ ...formData, name: user.name || '' });
        }
    }, [user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage('');

        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const updateData = { name: formData.name };
            if (formData.password) updateData.password = formData.password;

            const res = await axios.put('http://localhost:3000/api/users/profile', updateData);
            setMessage('Profile updated successfully');
            setFormData({ ...formData, password: '', confirmPassword: '' });
            // Refresh user data
            window.location.reload();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
            <h2>My Profile</h2>
            
            <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                {user.avatar && (
                    <div>
                        <strong>Avatar:</strong>
                        <img src={user.avatar} alt="Avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', marginLeft: '10px' }} />
                    </div>
                )}
            </div>

            <form onSubmit={handleUpdate} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
                <h3>Update Profile</h3>
                
                <div style={{ marginBottom: '15px' }}>
                    <label>Name:</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>New Password (leave blank to keep current):</label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                {formData.password && (
                    <div style={{ marginBottom: '15px' }}>
                        <label>Confirm Password:</label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        />
                    </div>
                )}

                {message && (
                    <div style={{ color: message.includes('success') ? 'green' : 'red', marginBottom: '15px' }}>
                        {message}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}
                >
                    {loading ? 'Updating...' : 'Update Profile'}
                </button>

                <button 
                    type="button"
                    onClick={logout}
                    style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Logout
                </button>
            </form>
        </div>
    );
}
```

**Cập nhật `frontend/src/App.js` - thêm route profile:**

```javascript
import Profile from './components/profile/Profile';

// ... trong Routes:
<Route 
    path="/profile" 
    element={
        <ProtectedRoute>
            <Profile />
        </ProtectedRoute>
    } 
/>
```

---

## 4. HOẠT ĐỘNG 3: QUẢN LÝ USER (ADMIN)

### 4.1. Sinh viên 1 - Backend: Tạo Admin Middleware

**Thêm vào `backend/controllers/profileController.js`:**

```javascript
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
```

### 4.2. Sinh viên 1 - Backend: Cập nhật User Controller với Admin

**File: `backend/controllers/userController.js` - thêm các function mới:**

```javascript
const User = require("../models/User");
const { protect, authorize } = require("./profileController");

// Lấy tất cả user (chỉ Admin)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -resetPasswordToken -resetPasswordExpire');
        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Error fetching users", 
            error: err.message 
        });
    }
};

// Xóa user (Admin hoặc tự xóa)
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const requestingUser = req.user;

        // Admin có thể xóa bất kỳ ai, user chỉ có thể xóa chính mình
        if (requestingUser.role !== 'admin' && requestingUser._id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this user"
            });
        }

        const deleted = await User.findByIdAndDelete(userId);
        if (!deleted) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        res.json({ 
            success: true,
            message: "User deleted successfully" 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Error deleting user", 
            error: err.message 
        });
    }
};

// Tạo user mới (Admin only - không dùng signup)
exports.createUser = async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ 
                success: false,
                message: "Name required" 
            });
        }
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ 
                success: false,
                message: "Valid email required" 
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: "Email already exists" 
            });
        }

        const newUser = new User({ 
            name: name.trim(), 
            email: email.trim(),
            password: 'default123' // Set default password, user should change
        });
        const savedUser = await newUser.save();
        
        // Remove password from response
        savedUser.password = undefined;

        res.status(201).json({
            success: true,
            user: savedUser
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Error creating user", 
            error: err.message 
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!updated) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }
        
        res.json({
            success: true,
            user: updated
        });
    } catch (err) {
        res.status(400).json({ 
            success: false,
            message: err.message 
        });
    }
};
```

### 4.3. Sinh viên 1 - Backend: Cập nhật User Routes với Auth

**File: `backend/routes/user.js`:**

```javascript
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../controllers/profileController');

// Admin routes
router.get('/users', protect, authorize('admin'), userController.getUsers);
router.post('/users', protect, authorize('admin'), userController.createUser);
router.put('/users/:id', protect, userController.updateUser);
router.delete('/users/:id', protect, userController.deleteUser);

module.exports = router;
```

### 4.4. Sinh viên 2 - Frontend: Tạo Admin Component

**File: `frontend/src/components/admin/AdminPanel.jsx`**

```javascript
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function AdminPanel() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchUsers();
        }
    }, [user]);

    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get('http://localhost:3000/api/users');
            setUsers(res.data.users || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await axios.delete(`http://localhost:3000/api/users/${userId}`);
            setUsers(users.filter(u => u._id !== userId));
            alert('User deleted successfully');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete user');
        }
    };

    if (user?.role !== 'admin') {
        return <div>Access denied. Admin only.</div>;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
            <h2>Admin Panel - User Management</h2>
            {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
            
            {loading ? (
                <div>Loading users...</div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Role</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u._id}>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u._id}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.name}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.email}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.role}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                    <button
                                        onClick={() => handleDelete(u._id)}
                                        style={{
                                            padding: '5px 10px',
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div style={{ marginTop: '20px' }}>
                <button
                    onClick={fetchUsers}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Refresh
                </button>
            </div>
        </div>
    );
}
```

**Cập nhật `frontend/src/App.js`:**

```javascript
import AdminPanel from './components/admin/AdminPanel';

// ... trong Routes:
<Route 
    path="/admin" 
    element={
        <ProtectedRoute>
            <AdminPanel />
        </ProtectedRoute>
    } 
/>
```

---

## 5. HOẠT ĐỘNG 4: TÍNH NĂNG NÂNG CAO

### 5.1. Sinh viên 3 - Database: Cập nhật User Schema (đã có resetPasswordToken ở phần 2.1)

### 5.2. Sinh viên 1 - Backend: Forgot & Reset Password

**Thêm vào `backend/controllers/authController.js`:**

```javascript
const crypto = require('crypto');

// Forgot Password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please provide email"
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Không báo lỗi chi tiết để tránh email enumeration
            return res.json({
                success: true,
                message: "If email exists, reset password link has been sent"
            });
        }

        // Tạo reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save({ validateBeforeSave: false });

        // Gửi email (cần cấu hình nodemailer)
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
        
        // TODO: Gửi email với resetUrl
        console.log('Reset Password URL:', resetUrl);

        res.json({
            success: true,
            message: "If email exists, reset password link has been sent",
            resetToken // Trong production, chỉ gửi qua email
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide token and password"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        // Hash token để so sánh
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        }).select('+password');

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        // Tạo token mới để đăng nhập luôn
        const jwtToken = generateToken(user._id);

        res.json({
            success: true,
            message: "Password reset successful",
            token: jwtToken
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
```

**Cập nhật `backend/routes/auth.js`:**

```javascript
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
```

### 5.3. Sinh viên 1 - Backend: Upload Avatar với Cloudinary

**Cài đặt:**
```bash
npm install cloudinary multer
```

**Tạo file: `backend/utils/cloudinary.js`:**

```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
```

**Thêm vào `backend/controllers/profileController.js`:**

```javascript
const cloudinary = require('../utils/cloudinary');
const multer = require('multer');

// Cấu hình multer để nhận file từ memory
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

exports.uploadAvatar = upload.single('avatar');

exports.updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image"
            });
        }

        // Upload lên Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'avatars',
                    transformation: [{ width: 200, height: 200, crop: 'fill' }]
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        // Cập nhật avatar trong DB
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { avatar: result.secure_url },
            { new: true }
        );

        res.json({
            success: true,
            message: "Avatar updated successfully",
            avatar: user.avatar
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
```

**Cập nhật `backend/routes/profile.js`:**

```javascript
const { protect, uploadAvatar, updateAvatar } = require('../controllers/profileController');

router.post(
    '/users/upload-avatar',
    protect,
    uploadAvatar,
    updateAvatar
);
```

### 5.4. Sinh viên 2 - Frontend: Forgot Password Component

**File: `frontend/src/components/auth/ForgotPassword.jsx`**

```javascript
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await axios.post('http://localhost:3000/api/auth/forgot-password', { email });
            setMessage(res.data.message + (res.data.resetToken ? ` Token: ${res.data.resetToken}` : ''));
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                {message && (
                    <div style={{ color: message.includes('sent') ? 'green' : 'red', marginBottom: '15px' }}>
                        {message}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>
            <p style={{ marginTop: '15px', textAlign: 'center' }}>
                <a href="/login">Back to Login</a>
            </p>
        </div>
    );
}
```

**File: `frontend/src/components/auth/ResetPassword.jsx`**

```javascript
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setMessage('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const res = await axios.post('http://localhost:3000/api/auth/reset-password', {
                token: token || prompt('Enter reset token:'),
                password
            });
            
            setMessage('Password reset successful! Redirecting...');
            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2>Reset Password</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="password"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                {message && (
                    <div style={{ color: message.includes('success') ? 'green' : 'red', marginBottom: '15px' }}>
                        {message}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>
        </div>
    );
}
```

### 5.5. Sinh viên 2 - Frontend: Avatar Upload Component

**Cập nhật `frontend/src/components/profile/Profile.jsx` - thêm upload avatar:**

```javascript
const [avatarFile, setAvatarFile] = useState(null);
const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');

const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);
    }
};

const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    const formData = new FormData();
    formData.append('avatar', avatarFile);

    setLoading(true);
    try {
        const res = await axios.post('http://localhost:3000/api/users/upload-avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        alert('Avatar updated successfully');
        setAvatarFile(null);
        window.location.reload();
    } catch (error) {
        alert(error.response?.data?.message || 'Upload failed');
    } finally {
        setLoading(false);
    }
};

// Thêm vào JSX:
<div style={{ marginBottom: '30px' }}>
    <h3>Avatar</h3>
    {avatarPreview && (
        <img 
            src={avatarPreview} 
            alt="Avatar Preview" 
            style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' }} 
        />
    )}
    <input
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        style={{ marginBottom: '10px' }}
    />
    {avatarFile && (
        <button
            type="button"
            onClick={handleAvatarUpload}
            disabled={loading}
            style={{ padding: '8px 16px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
            Upload Avatar
        </button>
    )}
</div>
```

**Cập nhật `frontend/src/App.js` - thêm routes:**

```javascript
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';

// ... trong Routes:
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />
```

---

## 6. HOẠT ĐỘNG 5: GIT WORKFLOW

### 6.1. Tạo các nhánh

```bash
# Sinh viên 1 - Backend
git checkout -b backend-auth
# Làm xong authentication
git add .
git commit -m "feat: implement authentication (signup, login, logout)"
git push origin backend-auth

git checkout -b backend-admin
# Làm xong admin features
git add .
git commit -m "feat: implement admin user management and RBAC"
git push origin backend-admin

# Sinh viên 2 - Frontend
git checkout -b frontend-auth
# Làm xong auth UI
git add .
git commit -m "feat: implement signup and login UI"
git push origin frontend-auth

git checkout -b frontend-profile
# Làm xong profile UI
git add .
git commit -m "feat: implement profile page and update functionality"
git push origin frontend-profile

# Sinh viên 3 - Database
git checkout -b database-auth
# Cập nhật schema
git add .
git commit -m "feat: update User schema with password, role, and reset token fields"
git push origin database-auth
```

### 6.2. Tạo Pull Request trên GitHub

1. Vào GitHub repository
2. Click "Compare & pull request" cho từng nhánh
3. Sinh viên 3 review và merge vào main
4. Merge theo thứ tự: database-auth → backend-auth → frontend-auth → backend-admin → frontend-profile

### 6.3. Sau khi merge, pull về local

```bash
git checkout main
git pull origin main
```

---

## 📝 CHECKLIST HOÀN THÀNH

### Hoạt động 1: Authentication cơ bản
- [ ] Schema User có password, role (database-auth branch)
- [ ] API /signup, /login, /logout (backend-auth branch)
- [ ] Form SignUp, Login (frontend-auth branch)
- [ ] Lưu JWT token vào localStorage
- [ ] Screenshot Postman test API
- [ ] Screenshot giao diện SignUp/Login

### Hoạt động 2: Quản lý thông tin cá nhân
- [ ] API /profile GET, PUT với JWT middleware
- [ ] Trang Profile React
- [ ] Form cập nhật name, password
- [ ] Screenshot Profile page
- [ ] Screenshot Postman test

### Hoạt động 3: Quản lý User (Admin)
- [ ] API /users GET, DELETE với RBAC middleware
- [ ] Giao diện Admin Panel
- [ ] Kiểm thử role Admin
- [ ] Screenshot Admin page
- [ ] Screenshot Postman test với Admin token

### Hoạt động 4: Tính năng nâng cao
- [ ] API /forgot-password, /reset-password
- [ ] Form Forgot Password
- [ ] API /upload-avatar với Cloudinary
- [ ] UI Upload Avatar
- [ ] Screenshot các tính năng

### Hoạt động 5: Git Workflow
- [ ] Tạo các nhánh theo phân công
- [ ] Commit messages rõ ràng
- [ ] Pull Request trên GitHub
- [ ] Merge vào main
- [ ] Screenshot GitHub branches và PRs

---

## 🚀 CÁCH CHẠY PROJECT

### Backend
```bash
cd backend
npm install
# Tạo file .env với các biến môi trường
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### MongoDB
Đảm bảo MongoDB đang chạy hoặc sử dụng MongoDB Atlas.

---

## 📸 YÊU CẦU SCREENSHOT

1. **Postman Collection:**
   - Sign Up request/response
   - Login request/response (có JWT token)
   - Get Profile với Bearer token
   - Update Profile
   - Get Users (Admin)
   - Delete User
   - Forgot Password
   - Reset Password
   - Upload Avatar

2. **Giao diện React:**
   - Trang Sign Up
   - Trang Login
   - Trang Profile
   - Trang Admin Panel
   - Form Forgot Password
   - Upload Avatar

3. **GitHub:**
   - Danh sách branches
   - Pull Requests
   - Commit history

---

## 💡 LƯU Ý QUAN TRỌNG

1. **JWT_SECRET**: Phải đổi trong production
2. **Cloudinary**: Cần đăng ký tài khoản và cấu hình trong .env
3. **Email**: Cần cấu hình nodemailer nếu muốn gửi email thật
4. **Validation**: Kiểm tra kỹ input ở cả frontend và backend
5. **Error Handling**: Xử lý lỗi đầy đủ ở mọi API endpoint
6. **Security**: Không expose password, token trong response

Chúc các bạn thành công! 🎉

