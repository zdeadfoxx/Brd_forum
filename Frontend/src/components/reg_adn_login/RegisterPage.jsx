import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/register.css';

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Имя обязательно';
    if (!formData.email.trim()) newErrors.email = 'Email обязателен';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) 
      newErrors.email = 'Некорректный формат email';
    if (!formData.password) newErrors.password = 'Пароль обязателен';
    else if (formData.password.length < 6) 
      newErrors.password = 'Минимум 6 символов';
    if (formData.password !== formData.confirmPassword) 
      newErrors.confirmPassword = 'Пароли не совпадают';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Замените на реальный API-запрос
      await new Promise(res => setTimeout(res, 1500));
      setIsSuccess(true);
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      setErrors({ submit: 'Ошибка сервера. Попробуйте позже.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="reg-wrapper">
        <main className="reg-main">
          <div className="reg-card reg-card--success">
            <div className="success-icon">✓</div>
            <h2 className="reg-title">Регистрация завершена!</h2>
            <p className="reg-subtitle">На вашу почту отправлено письмо для подтверждения аккаунта.</p>
            <Link to="/login" className="reg-btn reg-btn--full">Перейти ко входу</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="reg-wrapper">
      <header className="reg-header">
        <Link to="/" className="reg-logo">BRAND</Link>
        <nav className="reg-nav">
          <Link to="/login">Войти</Link>
        </nav>
      </header>

      <main className="reg-main">
        <div className="reg-card">
          <h1 className="reg-title">Создать аккаунт</h1>
          <p className="reg-subtitle">Заполните данные для регистрации. Это займёт всего минуту.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Имя</label>
              <input
                className="form-input"
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Иван Иванов"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && <div id="name-error" className="form-error">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                className="form-input"
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && <div id="email-error" className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Пароль</label>
              <div className="input-wrapper">
                <input
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>
              {errors.password && <div id="password-error" className="form-error">{errors.password}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Подтвердите пароль</label>
              <input
                className="form-input"
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
              />
              {errors.confirmPassword && <div id="confirm-password-error" className="form-error">{errors.confirmPassword}</div>}
            </div>

            {errors.submit && <div className="form-error form-error--submit">{errors.submit}</div>}

            <button type="submit" className="reg-btn" disabled={isSubmitting}>
              {isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </form>

          <p className="reg-footer-text">
            Уже есть аккаунт? <Link to="/login" className="reg-link">Войти</Link>
          </p>
        </div>
      </main>

      <footer className="reg-footer">
        © {new Date().getFullYear()} Ваша компания. Все права защищены.
      </footer>
    </div>
  );
};

export default RegistrationPage;