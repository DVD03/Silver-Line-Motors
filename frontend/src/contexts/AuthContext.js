// contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.id, username: payload.username, role: payload.role });
        axios.get('http://localhost:5000/api/profile')
          .then(res => setUser(res.data))
          .catch(() => {
            setUser(null);
            setToken('');
            localStorage.removeItem('token');
          });
      } catch {
        setUser(null);
        setToken('');
        localStorage.removeItem('token');
      }
    } else {
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = (data) => {
    setToken(data.token);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('token');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};