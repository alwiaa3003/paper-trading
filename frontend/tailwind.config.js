/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#FAF9F6',
        panel: '#FFFFFF',
        panel2: '#F2F0EB',
        line: '#E8E5DE',
        mist: '#79766F',
        paper: '#211F1C',
        gain: '#1E8E5A',
        loss: '#D64545',
        signal: '#C98A2C',
        accent: '#4F46E5',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(33, 31, 28, 0.04), 0 4px 16px rgba(33, 31, 28, 0.04)',
        softer: '0 1px 3px rgba(33, 31, 28, 0.06)',
      },
    },
  },
  plugins: [],
};
