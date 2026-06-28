/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#FE9EC7',
          yellow: '#F9F6C4',
          sky: '#89D4FF',
          blue: '#44ACFF',
        },
        app: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E5E7EB',
        },
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
      },
      borderRadius: {
        'app-sm': '12px',
        'app-md': '16px',
        'app-lg': '20px',
        'app-xl': '24px',
        'app-2xl': '32px',
        'xl2': '1.25rem',
        'xl3': '1.75rem',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(31, 41, 55, 0.06)',
        pastel: '0 16px 40px rgba(254, 158, 199, 0.16)',
        blueSoft: '0 16px 40px rgba(68, 172, 255, 0.12)',
      },
    },
  },
  plugins: [],
}
