import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './contexts/AuthContext';
import router from './router';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Login from './page/login';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AuthProvider>
      <BrowserRouter router={router}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<App />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
