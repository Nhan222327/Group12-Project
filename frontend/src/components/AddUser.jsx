import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Helper validation
const validateUser = ({ name, email }) => {
  const errors = {};
  if (!name || !name.trim()) errors.name = 'Name không được để trống';
  if (!email || !/\S+@\S+\.\S+/.test(email)) errors.email = 'Email không hợp lệ';
  return { ok: Object.keys(errors).length === 0, errors };
};

export default function AddUser({ fetchUsers, editUser, onSave }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [localErrors, setLocalErrors] = useState({});
  const [loadingSave, setLoadingSave] = useState(false);
  const [errorSave, setErrorSave] = useState(null);

  useEffect(() => {
    if (editUser) {
      setName(editUser.name || '');
      setEmail(editUser.email || '');
      setLocalErrors({});
      setErrorSave(null);
    } else {
      setName('');
      setEmail('');
    }
  }, [editUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorSave(null);
    const { ok, errors } = validateUser({ name, email });
    setLocalErrors(errors);
    if (!ok) return;

    setLoadingSave(true);
    try {
      if (editUser) {
        // PUT
        await axios.put(`http://localhost:3000/api/users/${editUser._id}`, { name: name.trim(), email: email.trim() });
        if (typeof onSave === 'function') onSave();
      } else {
        // POST
        await axios.post('http://localhost:3000/api/users', { name: name.trim(), email: email.trim() });
        if (typeof fetchUsers === 'function') fetchUsers();
      }
      // reset form if added
      if (!editUser) { setName(''); setEmail(''); }
    } catch (err) {
      setErrorSave(err?.response?.data?.message || err.message || 'Lưu không thành công');
    } finally {
      setLoadingSave(false);
    }
  };

  const handleCancel = () => {
    setName(''); setEmail(''); setLocalErrors({}); if (typeof onSave === 'function') onSave();
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      <div>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          aria-label="Name"
        />
        {localErrors.name && <div style={{ color: 'red' }}>{localErrors.name}</div>}
      </div>

      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          aria-label="Email"
        />
        {localErrors.email && <div style={{ color: 'red' }}>{localErrors.email}</div>}
      </div>

      {errorSave && <div style={{ color: 'red' }}>{errorSave}</div>}

      <button type="submit" disabled={loadingSave}>
        {loadingSave ? 'Đang lưu...' : (editUser ? 'Lưu thay đổi' : 'Thêm User')}
      </button>

      {editUser && <button type="button" onClick={handleCancel} disabled={loadingSave}>Hủy</button>}
    </form>
  );
}
