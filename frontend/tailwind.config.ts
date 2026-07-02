import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      backgroundImage: {
        'gradient-sky': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-sunny': 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        'gradient-rainy': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'gradient-night': 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
