import React, { createContext, useContext, useState, useEffect } from 'react';
import { userLoginToPwd, userLoginToToken } from '../api/user';

// 认证状态类型


// 创建认证上下文
export const AuthContext = createContext(undefined);

// 认证提供者组件
export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
  });

  // 从本地存储加载认证状态
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const user = localStorage.getItem('user');
        const { data, code, message } = await userLoginToToken();
        if (code === 0) {
          localStorage.setItem('user', JSON.stringify(data));
          setState({
            ...state,
            user: data,
            isAuthenticated: true,
            loading: false,
          });
          if (!window.location.pathname.includes('/home')) window.location.href = window.location.origin + '/home'
          return true;
        } else {
          if (window.location.pathname !== '/') {
            window.location.href = window.location.origin
          }
          localStorage.setItem('user', "");
          setState({
            isAuthenticated: false,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Failed to load auth state:', error);
        setState({ ...state, loading: false });
      }
    };

    loadAuthState();
  }, []);

  // 登录函数
  const login = async (loginData) => {
    try {
      const { data, code: resCode, message } = await userLoginToPwd(loginData)
      if (resCode === 0) {
        localStorage.setItem('user', JSON.stringify(data));
        setState({
          ...state,
          user: data,
          isAuthenticated: true,
          loading: false,
        });
        return true;
      } else {
        console.error(message)
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  // 登出函数
  const logout = () => {
    // 清除本地存储中的认证信息
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 更新状态
    setState({
      ...state,
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
    });
  };

  // 注册函数
  const register = async (email, password) => {
    try {
      // 这里应该调用后端 API 进行注册
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });

      // 模拟注册成功后直接登录
      return await login(email, password);
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const value = { state, login, logout, register };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 自定义钩子，方便在组件中使用认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};    