import React, { lazy, Suspense } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import DynamicFavicon from './components/DynamicFavicon';
import GoogleTag from './components/GoogleTag';

const HomePage = lazy(() => import('./pages/HomePage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NewsListPage = lazy(() => import('./pages/NewsListPage'));
const NewsDetailPage = lazy(() => import('./pages/NewsDetailPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const LoginPage = lazy(() => import('./admin/LoginPage'));
const DashboardPage = lazy(() => import('./admin/DashboardPage'));
const SlidersPage = lazy(() => import('./admin/SlidersPage'));
const VehiclesPage = lazy(() => import('./admin/VehiclesPage'));
const NewsPage = lazy(() => import('./admin/NewsPage'));
const CustomersPage = lazy(() => import('./admin/CustomersPage'));
const UsersPage = lazy(() => import('./admin/UsersPage'));
const SiteSettingsPage = lazy(() => import('./admin/SiteSettingsPage'));
const MailSettingsPage = lazy(() => import('./admin/MailSettingsPage'));

const PageFallback = () => (
    <div className="flex min-h-screen items-center justify-center bg-white text-sm text-neutral-500">
        Đang tải…
    </div>
);

function App() {
    return (
        <Router>
            <ScrollToTop />
            <DynamicFavicon />
            <GoogleTag />
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/xe/:id" element={<ProductDetailPage />} />
                <Route path="/gioi-thieu" element={<AboutPage />} />
                <Route path="/lien-he" element={<ContactPage />} />
                <Route path="/tin-tuc" element={<NewsListPage />} />
                <Route path="/tin-tuc/:id" element={<NewsDetailPage />} />

                <Route path="/admin/login" element={<LoginPage />} />
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="sliders" element={<SlidersPage />} />
                    <Route path="vehicles" element={<VehiclesPage />} />
                    <Route path="news" element={<NewsPage />} />
                    <Route path="customers" element={<CustomersPage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="settings/site" element={<SiteSettingsPage />} />
                    <Route path="settings/mail" element={<MailSettingsPage />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
