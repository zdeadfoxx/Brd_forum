// src/pages/RegisterPage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    profileName: "",
    login: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.profileName.trim()) newErrors.profileName = "Имя профиля обязательно";
    if (!formData.login.trim()) newErrors.login = "Логин обязателен";
    if (!formData.email.trim()) newErrors.email = "Email обязателен";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Введите корректный email";

    if (!formData.password) newErrors.password = "Пароль обязателен";
    if (formData.password.length < 6)
      newErrors.password = "Пароль должен быть не менее 6 символов";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Пароли не совпадают";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Данные регистрации:", formData);
      // Переход на страницу входа
      navigate("/login");
    }
  };

  return (
    <div className="register-form">
      <h2>Регистрация</h2>

      <form onSubmit={handleSubmit}>
        {/* Имя профиля */}
        <div className="form-group">
          <label>Имя профиля</label>
          <input
            type="text"
            name="profileName"
            value={formData.profileName}
            onChange={handleChange}
            placeholder="Введите имя профиля"
          />
          {errors.profileName && (
            <span className="error">{errors.profileName}</span>
          )}
        </div>

        {/* Логин */}
        <div className="form-group">
          <label>Логин</label>
          <input
            type="text"
            name="login"
            value={formData.login}
            onChange={handleChange}
            placeholder="Логин"
          />
          {errors.login && <span className="error">{errors.login}</span>}
        </div>

        {/* Почта */}
        <div className="form-group">
          <label>Электронная почта</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        {/* Пароль */}
        <div className="form-group">
          <label>Пароль</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Пароль"
          />
          {errors.password && (
            <span className="error">{errors.password}</span>
          )}
        </div>

        {/* Подтверждение пароля */}
        <div className="form-group">
          <label>Подтвердите пароль</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Повторите пароль"
          />
          {errors.confirmPassword && (
            <span className="error">{errors.confirmPassword}</span>
          )}
        </div>

        {/* Кнопка */}
        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
}
