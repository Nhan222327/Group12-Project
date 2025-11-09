import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navigation() {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!isAuthenticated) {
        return null; // Không hiển thị navigation khi chưa đăng nhập
    }

    return (
        <nav style={{
            backgroundColor: '#343a40',
            color: 'white',
            padding: '1rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>👥 Quản lý Users</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {user?.role === 'admin' && (
                        <Link 
                            to="/users" 
                            style={{ 
                                color: 'white', 
                                textDecoration: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                transition: 'background-color 0.3s',
                                fontSize: '14px'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#495057'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            📋 Danh sách Users (Admin)
                        </Link>
                    )}
                    <Link 
                        to="/profile" 
                        style={{ 
                            color: 'white', 
                            textDecoration: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '4px',
                            transition: 'background-color 0.3s',
                            fontSize: '14px'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#495057'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        👤 Thông tin cá nhân
                    </Link>
                </div>
            </div>
            
            {user?.role === 'admin' && (
                <div style={{ 
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    textTransform: 'uppercase'
                }}>
                    👑 ADMIN
                </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {user && (
                    <span style={{ color: '#adb5bd', fontSize: '14px' }}>
                        Xin chào, <strong style={{ color: 'white' }}>{user.name || user.email}</strong>
                    </span>
                )}
                <button
                    onClick={handleLogout}
                    className="btn btn-danger"
                    style={{
                        padding: '0.5rem 1.5rem',
                        fontSize: '0.9rem'
                    }}
                >
                    🚪 Đăng xuất
                </button>
            </div>
        </nav>
    );
}

