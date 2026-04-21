import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    loginOrEmail: "",
    password: "",
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

    if (!formData.loginOrEmail.trim()) {
      newErrors.loginOrEmail = "Логин или email обязательны";
    }

    if (!formData.password) {
      newErrors.password = "Пароль обязателен";
    } else if (formData.password.length < 6) {
      newErrors.password = "Пароль должен быть не менее 6 символов";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    const value = formData.loginOrEmail.trim();

    // Ищем пользователя по логину или email
    const matchedUser = mockUsers.find(
      (user) =>
        user.login === value ||
        user.email === value ||
        user.login === value.toLowerCase() ||
        user.email === value.toLowerCase()
    );

    if (!matchedUser) {
      setErrors({
        loginOrEmail: "Пользователь с таким логином или email не найден",
        password: "",
      });
      return;
    }

    if (matchedUser.password !== formData.password) {
      setErrors({
        password: "Неверный пароль",
        loginOrEmail: "",
      });
      return;
    }

    // Успешная авторизация переход на HomePage
    console.log("Авторизация успешна, пользователь:", matchedUser);
    navigate("/");
  };

  return (
    <div className="login-form">
      <h2>Вход</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Логин или email</label>
          <input
            type="text"
            name="loginOrEmail"
            value={formData.loginOrEmail}
            onChange={handleChange}
            placeholder="Логин или email"
          />
          {errors.loginOrEmail && (
            <span className="error">{errors.loginOrEmail}</span>
          )}
        </div>

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

        <button type="submit">Войти</button>
      </form>
    </div>
  );
}
