/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte}'],
  theme: {
    extend: {
      colors: {
        primary: "#0ea5e9", // sky-500
        secondary: "#6366f1", // indigo-500
        accent: "#22c55e", // green-500
        neutral: "#334155", // slate-700
        'base-100': "#f8fafc", // slate-50
        info: "#3b82f6", // blue-500
        success: "#16a34a", // green-600
        warning: "#f59e0b", // amber-500
        error: "#ef4444", // red-500
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}