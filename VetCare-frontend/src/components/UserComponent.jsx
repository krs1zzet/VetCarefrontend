import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UserComponent.css';

const UserComponent = () => {
    const [users, setUsers] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [age, setAge] = useState('');
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const response = await axios.get('http://localhost:8080/api/users');
        setUsers(response.data);
    };

    const createUser = async () => {
        await axios.post('http://localhost:8080/api/users', { name, email, password, age });
        fetchUsers();
    };

    const deleteUser = async (id) => {
        await axios.delete(`http://localhost:8080/api/users/${id}`);
        fetchUsers();
    };

    const updateUser = async () => {
        await axios.put(`http://localhost:8080/api/users/${editId}`, { name, email, password, age });
        fetchUsers();
        setEditId(null);
    };

    return (
        <div>
            <h2>User Management</h2>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" />
            <button onClick={editId ? updateUser : createUser}>
                {editId ? 'Update User' : 'Create User'}
            </button>
            <div className="user-cards">
                {users.map(user => (
                    <div className="user-card" key={user.id}>
                        <h3>{user.name}</h3>
                        <p>Email: {user.email}</p>
                        <p>Age: {user.age}</p>
                        <button onClick={() => { setEditId(user.id); setName(user.name); setEmail(user.email); setPassword(''); setAge(user.age); }}>
                            Edit
                        </button>
                        <button onClick={() => deleteUser(user.id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserComponent; 