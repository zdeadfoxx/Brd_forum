import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

//  Навигация (путь от src/components/App.jsx)
import NavBar from '../../include/navigation/nav_bar';
import FooterBar from '../../include/navigation/footer_bar';

// 📄 Страницы (из той же папки components)
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import RegisterPage from './reg_adn_login/RegisterPage'; // <-- ваша папка
import DashboardPage from './DashboardPage';
import ChatPage from './ChatPage';
import ForumPage from './ForumPage';
import TopicPage from './TopicPage';
import VacancyListPage from './VacancyListPage';
import VacancyDetailPage from './VacancyDetailPage';
import OrderListPage from './OrderListPage';
import CreateOrderPage from './CreateOrderPage';
import OrderDetailPage from './OrderDetailPage';
import ProfilePage from './ProfilePage';

// 🧩 Общий макет (хедер + футер + контент)
const MainLayout = ({ children }) => (
  <>
    <NavBar />
    <main className="main-content">{children}</main>
    <FooterBar />
  </>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* 🔐 Страницы авторизации (без общего хедера/футера) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 🌐 Основные страницы (с навигацией и футером) */}
        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/dashboard" element={<MainLayout><DashboardPage /></MainLayout>} />
        <Route path="/chat" element={<MainLayout><ChatPage /></MainLayout>} />
        <Route path="/forum" element={<MainLayout><ForumPage /></MainLayout>} />
        <Route path="/forum/topic/:id" element={<MainLayout><TopicPage /></MainLayout>} />
        <Route path="/vacancies" element={<MainLayout><VacancyListPage /></MainLayout>} />
        <Route path="/vacancies/:id" element={<MainLayout><VacancyDetailPage /></MainLayout>} />
        <Route path="/orders" element={<MainLayout><OrderListPage /></MainLayout>} />
        <Route path="/orders/create" element={<MainLayout><CreateOrderPage /></MainLayout>} />
        <Route path="/orders/:id" element={<MainLayout><OrderDetailPage /></MainLayout>} />
        <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />

        {/* 🚫 404 - редирект на главную */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;