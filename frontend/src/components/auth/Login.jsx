import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

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
        if (!formData.email.trim()) newErrors.email = 'Email không được để trống';
        if (!formData.password) newErrors.password = 'Mật khẩu không được để trống';
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
        <div style={{ 
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            padding: '20px'
        }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333', marginTop: 0 }}>🔐 Đăng nhập</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label className="label">Email</label>
                        <input
                            type="email"
                            className="input"
                            placeholder="Nhập email của bạn"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        {errors.email && <div className="error-message">{errors.email}</div>}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label className="label">Mật khẩu</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="Nhập mật khẩu"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        {errors.password && <div className="error-message">{errors.password}</div>}
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn btn-success"
                        style={{ width: '100%', padding: '12px', fontSize: '16px' }}
                    >
                        {loading ? 'Đang đăng nhập...' : '🚀 Đăng nhập'}
                    </button>
                </form>
                <div style={{ marginTop: '15px', textAlign: 'center' }}>
                    <Link to="/forgot-password" style={{ color: '#007bff', textDecoration: 'none', fontSize: '14px' }}>
                        🔑 Quên mật khẩu?
                    </Link>
                </div>
                <p style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
                    Chưa có tài khoản? <Link to="/signup" style={{ color: '#007bff', textDecoration: 'none', fontWeight: '500' }}>Đăng ký ngay</Link>
                </p>
            </div>
        </div>
    );
}

