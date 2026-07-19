/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './index.js', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#F8F9FA',
          dark: '#0F0F1A',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#1A1A2E',
        },
        foreground: {
          DEFAULT: '#1A1A2E',
          muted: '#6B7280',
          dark: '#F9FAFB',
          'muted-dark': '#9CA3AF',
        },
        brand: {
          DEFAULT: '#4F46E5',
          dark: '#6366F1',
          foreground: '#FFFFFF',
        },
        border: {
          DEFAULT: '#E5E7EB',
          dark: '#374151',
        },
      },
    },
  },
  plugins: [],
};
