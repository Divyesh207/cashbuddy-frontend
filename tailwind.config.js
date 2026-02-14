/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./App.tsx"
    ],
    darkMode: 'class',
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
          display: ['Outfit', 'sans-serif'],
        },
        colors: {
          // Premium Emerald Palette
          primary: {
            50: '#ecfdf5',
            100: '#d1fae5',
            200: '#a7f3d0',
            300: '#6ee7b7',
            400: '#34d399',
            500: '#10b981',
            600: '#059669',
            700: '#047857',
            800: '#065f46',
            900: '#064e3b',
            950: '#022c22',
          },
          // Deep Slate for Dark Mode
          slate: {
            850: '#1e293b', // Custom dark shade
            900: '#0f172a',
            950: '#020617',
          }
        },
        animation: {
          'fade-in': 'fadeIn 0.5s ease-out',
          'slide-up': 'slideUp 0.5s ease-out',
          'slide-in-right': 'slideInRight 0.3s ease-out',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideUp: {
            '0%': { transform: 'translateY(10px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
          slideInRight: {
            '0%': { transform: 'translateX(100%)' },
            '100%': { transform: 'translateX(0)' },
          }
        },
        boxShadow: {
          'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
          'neon': '0 0 10px rgba(16, 185, 129, 0.5)',
        },
        backdropBlur: {
          xs: '2px',
        }
      },
    },
    plugins: [],
  }
