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
        brand: {
          50: '#fcf8f2',
          100: '#f8f0e3',
          200: '#f1dec6',
          300: '#e7c6a0',
          400: '#dca474',
          500: '#d28450',
          600: '#c56b43',
          700: '#a45237',
          800: '#844232',
          900: '#6c382b',
        },
      },
    },
  },
  plugins: [],
};
export default config;

