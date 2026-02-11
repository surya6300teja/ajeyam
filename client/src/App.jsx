import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import BlogList from './pages/BlogList';
import BlogDetail from './pages/BlogDetail';
import CreateBlog from './pages/CreateBlog';
import Login from './pages/Login';
import Signup from './pages/SignUp';
import AdminDashboard from './pages/admin/AdminDashboard';
import Categories from './pages/Categories';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Profile from './pages/Profile';
import BookReviewsList from './pages/BookReviewsList';
import BookReviewDetail from './pages/BookReviewDetail';
import CreateBookReview from './pages/CreateBookReview';
import MyBookReviews from './pages/MyBookReviews';
import AdminBookReviews from './pages/admin/AdminBookReviews';
import AdminCategories from './pages/admin/AdminCategories';
import About from './pages/About';
import TermsOfService from './pages/TermsOfService';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public routes */}
        <Route index element={<Home />} />
        <Route path="blogs" element={<BlogList />} />
        <Route path="blogs/:id" element={<BlogDetail />} />
        <Route path="categories" element={<Categories />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="book-reviews" element={<BookReviewsList />} />
        <Route path="book-reviews/:id" element={<BookReviewDetail />} />
        <Route path="about" element={<About />} />
        <Route path="terms-of-service" element={<TermsOfService />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />

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
      </Route>
    </Routes>
  );
}

export default App;
