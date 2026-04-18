import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <h2>Добро пожаловать!</h2>
      <p>Выберите раздел:</p>

      <div className="home-buttons">
        <button type="button" onClick={() => navigate("/chat")}>
          Чат
        </button>
        <button type="button" onClick={() => navigate("/forum")}>
          Форум
        </button>
        <button type="button" onClick={() => navigate("/profile")}>
          Профиль
        </button>
      </div>
    </div>
  );
}
