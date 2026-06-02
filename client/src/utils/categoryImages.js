// Image resolution for categories.
//
// Admins upload a real image per category (stored as category.imageUrl).
// Until one is set, we render a safe, on-brand generated placeholder — a warm
// gradient with a subtle motif — instead of a stock photo. This avoids ever
// showing imagery that doesn't fit the brand's values, and needs no external
// requests. A real imageUrl always takes precedence.

// Warm, heritage-toned palette (amber/saffron range)
const PALETTES = [
  ['#7c2d12', '#b45309'],
  ['#92400e', '#d97706'],
  ['#78350f', '#a16207'],
  ['#9a3412', '#c2410c'],
  ['#854d0e', '#b45309'],
];

// Deterministic palette pick from the category name so it's stable per category
const pickPalette = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTES[hash % PALETTES.length];
};

const placeholder = (name = '') => {
  const [a, b] = pickPalette(name);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='1000'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='${a}'/>
        <stop offset='1' stop-color='${b}'/>
      </linearGradient>
    </defs>
    <rect width='800' height='1000' fill='url(#g)'/>
    <circle cx='400' cy='420' r='150' fill='none' stroke='#ffffff' stroke-opacity='0.18' stroke-width='3'/>
    <circle cx='400' cy='420' r='90' fill='none' stroke='#ffffff' stroke-opacity='0.22' stroke-width='2'/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// Returns the best available image for a category:
// real imageUrl (if it's an actual URL) -> safe generated placeholder.
export function getCategoryImage(category) {
  const url = category?.imageUrl;
  if (typeof url === 'string' && /^https?:\/\//i.test(url.trim())) {
    return url.trim();
  }
  return placeholder(category?.name || '');
}

export default getCategoryImage;
