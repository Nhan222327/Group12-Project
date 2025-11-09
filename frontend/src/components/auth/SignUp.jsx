import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

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
        if (!formData.name.trim()) newErrors.name = 'Tên không được để trống';
        if (!formData.email.trim()) newErrors.email = 'Email không được để trống';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email không hợp lệ';
        if (!formData.password) newErrors.password = 'Mật khẩu không được để trống';
        else if (formData.password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
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
        <div style={{ 
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            padding: '20px'
        }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333', marginTop: 0 }}>📝 Đăng ký</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label className="label">Tên</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Nhập tên của bạn"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        {errors.name && <div className="error-message">{errors.name}</div>}
                    </div>

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
                            placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                        {errors.password && <div className="error-message">{errors.password}</div>}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label className="label">Xác nhận mật khẩu</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="Nhập lại mật khẩu"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />
                        {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '12px', fontSize: '16px' }}
                    >
                        {loading ? 'Đang đăng ký...' : '✨ Đăng ký'}
                    </button>
                </form>
                <p style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
                    Đã có tài khoản? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: '500' }}>Đăng nhập ngay</Link>
                </p>
            </div>
        </div>
    );
}