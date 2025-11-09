import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [resetToken, setResetToken] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        setResetToken('');

        try {
            const res = await axios.post('http://localhost:3000/api/auth/forgot-password', {
                email: email.trim()
            });

            setMessage(res.data.message);
            // Trong development, token sẽ được trả về
            if (res.data.resetToken) {
                setResetToken(res.data.resetToken);
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
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
                    🔑 Quên mật khẩu
                </h2>
                
                <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
                    Nhập email của bạn và chúng tôi sẽ gửi link reset password cho bạn.
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label className="label">Email</label>
                        <input
                            type="email"
                            className="input"
                            placeholder="Nhập email của bạn"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
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
                        </div>
                    )}

                    {resetToken && (
                        <div style={{ 
                            marginBottom: '15px', 
                            padding: '12px', 
                            backgroundColor: '#e7f3ff', 
                            borderRadius: '4px',
                            border: '1px solid #b3d9ff'
                        }}>
                            <strong style={{ color: '#0066cc' }}>🔧 Development Mode:</strong>
                            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#333' }}>
                                Reset token: <code style={{ 
                                    backgroundColor: '#f0f0f0', 
                                    padding: '2px 6px', 
                                    borderRadius: '3px',
                                    wordBreak: 'break-all'
                                }}>{resetToken}</code>
                            </p>
                            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>
                                Link reset: <a 
                                    href={`/reset-password/${resetToken}`}
                                    style={{ color: '#0066cc' }}
                                >
                                    /reset-password/{resetToken.substring(0, 20)}...
                                </a>
                            </p>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '12px', fontSize: '16px' }}
                    >
                        {loading ? 'Đang gửi...' : '📧 Gửi link reset password'}
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

