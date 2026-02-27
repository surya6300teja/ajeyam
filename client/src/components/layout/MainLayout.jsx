import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from '../ScrollToTop';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Header />
      <main className="flex-grow bg-background">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout; 