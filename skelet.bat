@echo off

npx create-react-app .

cd Frontend

npm install react-router-dom

mkdir src\components
mkdir src\layout
mkdir src\pages
mkdir src\services
mkdir src\routes

echo.>"src\pages\HomePage.jsx"
echo.>"src\pages\LoginPage.jsx"
echo.>"src\pages\RegisterPage.jsx"
echo.>"src\pages\OrderListPage.jsx"
echo.>"src\pages\OrderDetailPage.jsx"
echo.>"src\pages\VacancyListPage.jsx"
echo.>"src\pages\VacancyDetailPage.jsx"
echo.>"src\pages\ProfilePage.jsx"
echo.>"src\pages\ForumPage.jsx"
echo.>"src\pages\TopicPage.jsx"
echo.>"src\pages\DashboardPage.jsx"
echo.>"src\pages\CreateOrderPage.jsx"
echo.>"src\pages\ChatPage.jsx"