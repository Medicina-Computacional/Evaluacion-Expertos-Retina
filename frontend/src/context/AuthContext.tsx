import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import api from '../services/api';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Validate token and get user info
            api.get('/auth/me')
                .then((res) => setUser(res.data))
                .catch(() => localStorage.removeItem('token'))
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        const response = await api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const { access_token, user: userData } = response.data;
        localStorage.setItem('token', access_token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('ophthalmology_welcome_seen_session');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
