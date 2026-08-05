import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  content: [
    './app/**/*.{vue,js,ts}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Be Vietnam Pro"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Brand — warm terracotta orange (noodle factory warmth)
        primary: {
          50: '#fef7ee', 100: '#fcecd6', 200: '#f9d5ad', 300: '#f5b779',
          400: '#f1924b', 500: '#ed7628', 600: '#d85d1d', 700: '#b3471a',
          800: '#8f3a1c', 900: '#75311b', 950: '#3f1709',
        },
        // Secondary — deep teal (trust, finance, professional)
        secondary: {
          50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4',
          400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e',
          800: '#115e59', 900: '#134e4a', 950: '#042f2e',
        },
        // Accent — golden amber (CTA highlights, ratings)
        accent: {
          50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
          400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
          800: '#92400e', 900: '#78350f', 950: '#451a03',
        },
        success: {
          50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
          400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
          800: '#166534', 900: '#14532d', 950: '#052e16',
        },
        // Warning — distinct from accent (deeper amber-orange)
        warning: {
          50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
          400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
          800: '#9a3412', 900: '#7c2d12', 950: '#431407',
        },
        danger: {
          50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
          400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
          800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a',
        },
        info: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
          800: '#1e40af', 900: '#1e3a8a', 950: '#172554',
        },
        // Semantic surface tokens (dark mode aware via CSS vars)
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          foreground: 'rgb(var(--surface-foreground) / <alpha-value>)',
          muted: 'rgb(var(--surface-muted) / <alpha-value>)',
          border: 'rgb(var(--surface-border) / <alpha-value>)',
          hover: 'rgb(var(--surface-hover) / <alpha-value>)',
        },
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.125rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
      },
      spacing: {
        '18': '4.5rem',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.02), 0 1px 3px 0 rgb(0 0 0 / 0.03)',
        'md': '0 2px 4px -1px rgb(0 0 0 / 0.03), 0 4px 8px -2px rgb(0 0 0 / 0.04)',
        'lg': '0 4px 8px -2px rgb(0 0 0 / 0.04), 0 8px 16px -4px rgb(0 0 0 / 0.05)',
        'xl': '0 8px 16px -4px rgb(0 0 0 / 0.05), 0 16px 32px -8px rgb(0 0 0 / 0.07)',
        '2xl': '0 16px 32px -8px rgb(0 0 0 / 0.08), 0 24px 48px -12px rgb(0 0 0 / 0.1)',
        'card': '0 1px 2px 0 rgb(0 0 0 / 0.015), 0 1px 3px 0 rgb(0 0 0 / 0.02)',
        'card-hover': '0 2px 8px -2px rgb(0 0 0 / 0.04), 0 8px 20px -4px rgb(0 0 0 / 0.04)',
        'inner-sm': 'inset 0 1px 2px 0 rgb(0 0 0 / 0.03)',
        'glow-primary': '0 0 16px rgb(237 118 40 / 0.1)',
        'dropdown': '0 4px 12px -2px rgb(0 0 0 / 0.06), 0 8px 24px -4px rgb(0 0 0 / 0.05)',
        'popover': '0 8px 24px -4px rgb(0 0 0 / 0.08), 0 16px 40px -8px rgb(0 0 0 / 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'fade-in-up': 'fadeInUp 0.3s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.2s ease-out',
        'scale-in': 'scaleIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 1.8s infinite linear',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 0.6s linear',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeInUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideUp: { '0%': { transform: 'translateY(16px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideInRight: { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'translateX(0)' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        shimmer: { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.7' } },
        ripple: { '0%': { transform: 'scale(0)', opacity: '0.5' }, '100%': { transform: 'scale(4)', opacity: '0' } },
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
