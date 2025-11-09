import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        // Validation
        if (password.length < 6) {
            setError('Password phải có ít nhất 6 ký tự');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            setLoading(false);
            return;
        }

        try {
            const res = await axios.put(`http://localhost:3000/api/auth/reset-password/${token}`, {
                password
            });

            setMessage(res.data.message);
            
            // Redirect về login sau 2 giây
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err?.response?.data?.message || 'Token không hợp lệ hoặc đã hết hạn');
        } finally {
            setLoading(false);
        }
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
                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333', marginTop: 0 }}>
                    🔐 Đặt lại mật khẩu
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label className="label">Mật khẩu mới</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label className="label">Xác nhận mật khẩu</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="Nhập lại mật khẩu mới"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <div className="error-message" style={{ fontSize: '14px', marginBottom: '15px' }}>
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="success-message" style={{ fontSize: '14px', marginBottom: '15px' }}>
                            {message}
                            <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>
                                Đang chuyển đến trang đăng nhập...
                            </p>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading || !!message}
                        className="btn btn-success"
                        style={{ width: '100%', padding: '12px', fontSize: '16px' }}
                    >
                        {loading ? 'Đang xử lý...' : message ? '✅ Thành công' : '💾 Đặt lại mật khẩu'}
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', fontSize: '14px' }}>
                        ← Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
}

