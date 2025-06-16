import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import { useNavigate } from 'react-router-dom';
import { isTrue } from "../../tool/utils";
import { getEmailCode } from "../../api/user";
import { useAuth } from "../../contexts/AuthContext";


const Login = () => {
  const [formData, sFD] = useState({});
  const [showTip, setShowTip] = useState(false)
  const [loading, setLoading] = useState(false);
  const [emailcode, setEmailCode] = useState(0);
  const navigate = useNavigate();
  const loginStatus = useAuth();
  const setFormData = (abr, data) => {
    sFD(prev => ({ ...prev, [abr]: data }))
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading === false) {
      setLoading(true);
      const res =await loginStatus.login({ ...formData });
      setLoading(false);
      if (res) {
        navigate('/home');
      }
    }
  };

  const getcodeClick = async () => {
    if (emailcode) {
      return
    }
    const data = await getEmailCode({ email: formData.email });
    if (data.code === 0) {
      setEmailCode(30);
    }
  }

  const errectFunc = async () => {
    setLoading(true);
    console.log(loginStatus, 'loginStatus')
    if (loginStatus?.state?.user) {
      navigate('/home');
    }
    setLoading(false)
  }
  useEffect(() => {
    errectFunc();
  }, []);

  useEffect(() => {
    let id;
    if (emailcode) {
      id = setTimeout(() => {
        setEmailCode(prev => prev - 1)
      }, 1000)
    }
    return () => {
      clearTimeout(id);
    }
  }, [emailcode])

  return (
    <div className={styles["login-container"]} >
      <form className={styles["login-form"]} onSubmit={handleLogin}>
        <h2>登录{loading && <h5>正在加载用户信息</h5>}</h2>
        <div className={styles["form-group"]}>
          <input
            type="userName"
            id="userName"
            value={formData.username}
            onChange={(e) => setFormData("username", e.target.value)}
            placeholder="用户名"
          />
        </div>
        <div className={styles["form-group"]}>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => setFormData("password", e.target.value)}
            placeholder="密码"
          />
        </div>
        <div className={styles["form-group"]}>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData("email", e.target.value)}
            placeholder="邮箱: [ 如果是想注册 ] [非必填]"
          />
        </div>
        <div className={styles["form-group"]}>
          <input
            type="text"
            id="code"
            value={formData.code}
            onChange={(e) => setFormData("code", e.target.value)}
            placeholder="验证码: [ 如果是想注册 ] [非必填]"
          />

        </div>
        {formData.email && <button type="button" onClick={getcodeClick} className={styles['getCode']}>获取验证码{emailcode ? `(${emailcode})` : ''}</button>}
        <button type="submit" className={styles["btn-login"]}>密码登录</button>
        <p className={styles["forgot-password"]} onClick={() => { setShowTip(prve => !prve) }}>忘记密码 ?</p>
        {showTip && <><p>· 如果输入了邮箱和验证码</p>
          <p>· 服务器会将输入的密码作为新密码</p>
          <p>· 但是不会更新用户名</p></>}
      </form>
    </div >
  );
};

export default Login;
