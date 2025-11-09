import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Profile() {
    const { user, logout, fetchProfile } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [message, setMessage] = useState('');
    const [avatarMessage, setAvatarMessage] = useState('');
    const [avatarPreview, setAvatarPreview] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, name: user.name || '' }));
            setAvatarPreview(user.avatar || null);
        }
    }, [user]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setAvatarMessage('Chỉ chấp nhận file ảnh!');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setAvatarMessage('File ảnh không được vượt quá 5MB!');
            return;
        }

        setAvatarMessage(''); // Clear error when valid file selected

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleUploadAvatar = async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('avatar-input');
        const file = fileInput?.files[0];
        
        if (!file) {
            setAvatarMessage('Vui lòng chọn file ảnh');
            return;
        }

        setUploadingAvatar(true);
        setAvatarMessage('');

        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const res = await axios.post('http://localhost:3000/api/users/upload-avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setAvatarMessage('✅ Avatar đã được cập nhật thành công!');
            await fetchProfile();
            fileInput.value = ''; // Reset input
        } catch (error) {
            setAvatarMessage(error.response?.data?.message || 'Không thể upload avatar');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage('');

        if (formData.password) {
            if (formData.password.length < 6) {
                setMessage('Mật khẩu phải có ít nhất 6 ký tự');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setMessage('Mật khẩu xác nhận không khớp');
                return;
            }
        }

        setLoading(true);
        try {
            const updateData = { name: formData.name };
            if (formData.password) updateData.password = formData.password;

            await axios.put('http://localhost:3000/api/users/profile', updateData);
            setMessage('Cập nhật thông tin thành công!');
            setFormData({ ...formData, password: '', confirmPassword: '' });
            // Refresh user data
            await fetchProfile();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="loading">Đang tải thông tin</div>;

    return (
        <div className="page-content">
            <div className="card">
                <h2 style={{ marginTop: 0, marginBottom: '24px', color: '#333' }}>Thông tin cá nhân</h2>
                
                <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <p style={{ margin: '8px 0' }}>
                        <strong style={{ color: '#555' }}>Email:</strong> 
                        <span style={{ marginLeft: '10px', color: '#333' }}>{user.email}</span>
                    </p>
                    <p style={{ margin: '8px 0' }}>
                        <strong style={{ color: '#555' }}>Vai trò:</strong> 
                        <span style={{ marginLeft: '10px', color: '#333' }}>{user.role || 'User'}</span>
                    </p>
                    <div style={{ marginTop: '15px' }}>
                        <strong style={{ color: '#555', display: 'block', marginBottom: '10px' }}>Ảnh đại diện:</strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative' }}>
                                <img 
                                    src={avatarPreview || user.avatar || 'https://via.placeholder.com/150'} 
                                    alt="Avatar" 
                                    style={{ 
                                        width: '120px', 
                                        height: '120px', 
                                        borderRadius: '50%', 
                                        border: '3px solid #ddd',
                                        objectFit: 'cover',
                                        backgroundColor: '#f0f0f0'
                                    }} 
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <form onSubmit={handleUploadAvatar}>
                                    <input
                                        type="file"
                                        id="avatar-input"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        style={{ marginBottom: '10px', fontSize: '14px' }}
                                        disabled={uploadingAvatar}
                                    />
                                    <button
                                        type="submit"
                                        disabled={uploadingAvatar || !avatarPreview || avatarPreview === user.avatar}
                                        className="btn btn-primary"
                                        style={{ padding: '8px 16px', fontSize: '14px' }}
                                    >
                                        {uploadingAvatar ? 'Đang upload...' : '📤 Upload Avatar'}
                                    </button>
                                </form>
                                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                                    Chấp nhận: JPG, PNG, GIF (tối đa 5MB)
                                </p>
                                {avatarMessage && (
                                    <div className={avatarMessage.includes('✅') ? 'success-message' : 'error-message'} style={{ fontSize: '12px', marginTop: '8px' }}>
                                        {avatarMessage}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleUpdate}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Cập nhật thông tin</h3>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <label className="label">Tên</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label className="label">Mật khẩu mới (để trống nếu không đổi)</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    {formData.password && (
                        <div style={{ marginBottom: '20px' }}>
                            <label className="label">Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                className="input"
                                placeholder="Nhập lại mật khẩu mới"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>
                    )}

                    {message && (
                        <div className={message.includes('success') ? 'success-message' : 'error-message'} style={{ fontSize: '14px' }}>
                            {message}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn btn-primary"
                        >
                            {loading ? 'Đang cập nhật...' : '💾 Cập nhật thông tin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

