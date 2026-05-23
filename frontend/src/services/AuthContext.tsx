import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthContextType {
    userRole: string | null;
    userName: string | null;
    login: (role: string, name: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);

    const login = (role: string, name: string) => {
        setUserRole(role);
        setUserName(name);
    };

    const logout = () => {
        setUserRole(null);
        setUserName(null);
    };

    return (
        <AuthContext.Provider value={{ 
            userRole, 
            userName, 
            login, 
            logout, 
            isAuthenticated: !!userRole 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
