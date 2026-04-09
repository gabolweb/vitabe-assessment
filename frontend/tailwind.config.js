/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Brand navy — cor primária do produto
        brand: '#00285c',
        // Premium deep accent — não honey genérico
        accent: {
          50:  '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
        },
        // Surface palette — refinado, neutro quente
        surface: {
          0:   '#FFFFFF',
          50:  '#FAFAF9',
          100: '#F5F4F2',
          200: '#EAE9E6',
          300: '#D6D4CF',
          400: '#A8A49C',
          500: '#78746C',
          600: '#57534A',
          700: '#44403B',
          800: '#292524',
          900: '#1C1917',
        },
        // Estado selecionado — inverso premium
        selected: {
          bg:   '#1C1917',
          text: '#FFFFFF',
          sub:  '#A8A49C',
        },
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'xs':    '0 1px 2px rgba(0,0,0,0.05)',
        'sm':    '0 2px 8px rgba(0,0,0,0.06)',
        'md':    '0 4px 16px rgba(0,0,0,0.08)',
        'lg':    '0 8px 32px rgba(0,0,0,0.10)',
        'glow':  '0 0 0 3px rgba(249,115,22,0.18)',
        'ring':  '0 0 0 2px rgba(249,115,22,0.9)',
      },
      animation: {
        'fade-in':  'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'progress': 'progress linear',
        'shimmer':  'shimmer 1.8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(6px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.92)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        shimmer: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } },
        progress: { '0%': { transform: 'scaleX(1)' }, '100%': { transform: 'scaleX(0)' } },
      },
    },
  },
  plugins: [],
};
