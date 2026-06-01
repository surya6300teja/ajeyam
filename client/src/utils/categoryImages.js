// Curated fallback images for categories.
//
// Categories created in the admin panel may not have a real `imageUrl` set yet
// (some currently hold placeholder text like "..."). Until an admin uploads a
// proper image, we show a relevant stock photo keyed by the category name so the
// "Journey Through Time" grid doesn't fall back to one generic picture.
//
// A real `imageUrl` saved on the category always takes precedence over these.

const CATEGORY_IMAGES = {
  'Ancient India': 'https://images.unsplash.com/photo-1566136374023-df9e4de64ffb?auto=format&fit=crop&w=800&q=80',
  'Medieval India': 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
  'Indian Civilisation & Regions': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
  'Cultural Heritage': 'https://images.unsplash.com/photo-1585136917897-92bc92cc6d1b?auto=format&fit=crop&w=800&q=80',
  'People & Personalities': 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=800&q=80',
  'Conflict, Power & Resistance': 'https://images.unsplash.com/photo-1600020972626-96a0a7571e83?auto=format&fit=crop&w=800&q=80',
  'Ideas, Knowledge & Wisdom': 'https://images.unsplash.com/photo-1581888517319-2fb4e77011a6?auto=format&fit=crop&w=800&q=80',
  'History & the Present': 'https://images.unsplash.com/photo-1594402905608-d19a7f3c9f77?auto=format&fit=crop&w=800&q=80',
  'Rethinking History': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
  'Reading & Reflections': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80',
};

const DEFAULT_CATEGORY_IMAGE =
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80';

// Returns the best available image for a category:
// real imageUrl (if it's an actual URL) -> curated map by name -> generic default.
export function getCategoryImage(category) {
  const url = category?.imageUrl;
  if (typeof url === 'string' && /^https?:\/\//i.test(url.trim())) {
    return url.trim();
  }
  return CATEGORY_IMAGES[category?.name] || DEFAULT_CATEGORY_IMAGE;
}

export default getCategoryImage;
