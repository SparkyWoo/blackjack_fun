/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'brown-800': '#5D4037',
      },
      animation: {
        'deal': 'deal 0.5s ease-out forwards',
        'shine': 'shine 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'flip': 'flip 0.5s ease-out forwards',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        deal: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-100px) rotate(-20deg)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0) rotate(0)'
          },
        },
        shine: {
          '0%': { 
            transform: 'translateX(-100%) translateY(-100%)'
          },
          '100%': { 
            transform: 'translateX(100%) translateY(100%)'
          },
        },
        float: {
          '0%, 100%': { 
            transform: 'translateY(0)'
          },
          '50%': { 
            transform: 'translateY(-10px)'
          },
        },
        flip: {
          '0%': { 
            transform: 'rotateY(0deg)'
          },
          '100%': { 
            transform: 'rotateY(180deg)'
          },
        },
      },
    },
  },
  plugins: [],
} 