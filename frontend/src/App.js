import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Profile from './components/profile/Profile';
import UserList from './components/UserList';
import Navigation from './components/Navigation';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) return <div className="loading">Đang tải</div>;
    return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin Route Component - chỉ Admin mới được truy cập
const AdminRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth();
    
    if (loading) return <div className="loading">Đang tải</div>;
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (user?.role !== 'admin') {
        return (
            <div className="page-content">
                <div className="card">
                    <h2 style={{ color: '#dc3545' }}>⚠️ Không có quyền truy cập</h2>
                    <p>Bạn cần quyền Admin để truy cập trang này.</p>
                    <p>Vai trò hiện tại của bạn: <strong>{user?.role || 'user'}</strong></p>
                </div>
            </div>
        );
    }
    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Navigation />
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                        <Route 
                            path="/profile" 
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/users" 
                            element={
                                <AdminRoute>
                                    <UserList />
                                </AdminRoute>
                            } 
                        />
                        <Route path="/" element={<Navigate to="/profile" />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;