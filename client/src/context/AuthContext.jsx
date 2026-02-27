import { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('df_token'));
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('df_user')); } catch { return null; }
    });

    const login = useCallback(async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('df_token', data.accessToken);
        localStorage.setItem('df_user', JSON.stringify(data.user));
        setToken(data.accessToken);
        setUser(data.user);
        return data;
    }, []);

    const register = useCallback(async (email, password) => {
        const { data } = await api.post('/auth/register', { email, password });
        localStorage.setItem('df_token', data.accessToken);
        localStorage.setItem('df_user', JSON.stringify(data.user));
        setToken(data.accessToken);
        setUser(data.user);
        return data;
    }, []);

    const logout = useCallback(async () => {
        try { await api.post('/auth/logout'); } catch { }
        localStorage.removeItem('df_token');
        localStorage.removeItem('df_user');
        setToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ token, user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
