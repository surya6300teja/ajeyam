import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Route components are code-split so heavy pages (e.g. the TipTap editor on
// /create-blog, admin dashboards) don't load on every page.
const Home = lazy(() => import('./pages/Home'));
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const CreateBlog = lazy(() => import('./pages/CreateBlog'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/SignUp'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const Categories = lazy(() => import('./pages/Categories'));
const Profile = lazy(() => import('./pages/Profile'));
const BookReviewsList = lazy(() => import('./pages/BookReviewsList'));
const BookReviewDetail = lazy(() => import('./pages/BookReviewDetail'));
const CreateBookReview = lazy(() => import('./pages/CreateBookReview'));
const MyBookReviews = lazy(() => import('./pages/MyBookReviews'));
const AdminBookReviews = lazy(() => import('./pages/admin/AdminBookReviews'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const About = lazy(() => import('./pages/About'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Contact = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const NotFound = lazy(() => import('./pages/NotFound'));
const CategoryRedirect = lazy(() => import('./pages/CategoryRedirect'));
const AuthorProfile = lazy(() => import('./pages/AuthorProfile'));

const RouteFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-[#FBF7F4]">
    <div className="w-10 h-10 border-4 border-amber-900/20 border-l-amber-900 rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public routes */}
        <Route index element={<Home />} />
        <Route path="blogs" element={<BlogList />} />
        <Route path="blogs/:id" element={<BlogDetail />} />
        <Route path="authors/:id" element={<AuthorProfile />} />
        <Route path="categories" element={<Categories />} />
        {/* Legacy category links (e.g. /categories/medieval-india) now redirect
            to the filtered blog list instead of rendering a blank page. */}
        <Route path="categories/:slug" element={<CategoryRedirect />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="book-reviews" element={<BookReviewsList />} />
        <Route path="book-reviews/:id" element={<BookReviewDetail />} />
        <Route path="about" element={<About />} />
        <Route path="terms-of-service" element={<TermsOfService />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="create-blog" element={<CreateBlog />} />
          <Route path="profile" element={<Profile />} />
          <Route path="create-book-review" element={<CreateBookReview />} />
          <Route path="my-book-reviews" element={<MyBookReviews />} />
          {/* Add other protected routes here */}
        </Route>

        {/* Admin-only routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/book-reviews" element={<AdminBookReviews />} />
          <Route path="admin/categories" element={<AdminCategories />} />
          {/* Add other admin routes here */}
        </Route>

        {/* Catch-all: anything unmatched shows a friendly 404 instead of a blank page */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
    </Suspense>
  );
}

export default App;
