import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface IPrivateRoute {
    children: React.ReactNode;
}

export const PrivateRoute = ({ children }: IPrivateRoute) => {
    const { state } = useAuth();
    const location = useLocation();

    if (state.loading) {
        return <div>加载中...</div>;
    }

    if (!state.isAuthenticated) {
        // 未认证用户重定向到登录页，并带上原始路径
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};    