import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
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
            setFormData(prev => ({ ...prev, name: user.name || '' }));
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

