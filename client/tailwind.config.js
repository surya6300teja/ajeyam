/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        devanagari: ['Sanskrit Text', 'Arial', 'sans-serif'],
        serif: ['Crimson Pro', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#E78C3D',
          dark: '#d37a2e',
        },
        secondary: {
          DEFAULT: '#264653',
          dark: '#1c343e',
        },
        accent: '#FFD700',
        background: {
          DEFAULT: '#F9F5ED',
          dark: '#333333',
        },
        text: {
          DEFAULT: '#333333',
          light: '#F9F5ED',
        }
      },
      fontFamily: {
        'serif': ['Merriweather', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'blog-card': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'hover': '0 10px 15px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
} 