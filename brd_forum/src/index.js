import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import OrderListPage from "../pages/OrderListPage";
import OrderDetailPage from "../pages/OrderDetailPage";
import VacancyListPage from "../pages/VacancyListPage";
import VacancyDetailPage from "../pages/VacancyDetailPage";
import ProfilePage from "../pages/ProfilePage";
import ForumPage from "../pages/ForumPage";
import TopicPage from "../pages/TopicPage";
import DashboardPage from "../pages/DashboardPage";
import CreateOrderPage from "../pages/CreateOrderPage";
import ChatPage from "../pages/ChatPage";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/orders" element={<OrderListPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />

        <Route path="/vacancies" element={<VacancyListPage />} />
        <Route path="/vacancies/:id" element={<VacancyDetailPage />} />

        <Route path="/profile/:id" element={<ProfilePage />} />

        <Route path="/forum" element={<ForumPage />} />
        <Route path="/topic/:id" element={<TopicPage />} />

        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/create-order" element={<CreateOrderPage />} />
        <Route path="/chat/:roomId" element={<ChatPage />} />

      </Routes>
    </BrowserRouter>
  );
}
