import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

// Resolves a legacy /categories/:slug URL to the real category name and
// forwards to the filtered blog list (/blogs?category=Name). If the slug
// can't be matched, it falls back to the full blog list.
const CategoryRedirect = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    api.categories
      .getAllCategories({ limit: 100 })
      .then((res) => {
        const list =
          res?.data?.data?.categories ||
          res?.data?.categories ||
          (Array.isArray(res?.data) ? res.data : []);
        const match = list.find((c) => c.slug === slug);
        if (!active) return;
        if (match) {
          navigate(`/blogs?category=${encodeURIComponent(match.name)}`, { replace: true });
        } else {
          navigate('/blogs', { replace: true });
        }
      })
      .catch(() => active && navigate('/blogs', { replace: true }));
    return () => { active = false; };
  }, [slug, navigate]);

  return (
    <div className="min-h-[40vh] flex justify-center items-center bg-[#FBF7F4]">
      <div className="w-10 h-10 border-4 border-amber-900/20 border-l-amber-900 rounded-full animate-spin"></div>
    </div>
  );
};

export default CategoryRedirect;
