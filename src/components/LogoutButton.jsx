import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <button onClick={logout}>
      退出登录
    </button>
  );
};    