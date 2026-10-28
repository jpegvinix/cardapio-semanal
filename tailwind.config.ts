import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        banlek: {
          blue: '#1E7BE8',
          'blue-hover': '#1A6CD0',
          'blue-dark': '#165CB3',
          cyan: '#2DC6F0',
          navy: '#0F2742',
          dark: '#0B1929',
          ink: '#1A1F2B',
          body: '#475366',
          muted: '#64748B',
          line: '#E3E8EF',
          soft: '#EAF3FD',
          bg: '#F5F7FA',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(15, 39, 66, 0.06), 0 2px 6px -1px rgba(15, 39, 66, 0.04)',
        highlight: '0 8px 30px -4px rgba(30, 123, 232, 0.18)',
      },
    },
  },
  plugins: [],
};
export default config;
