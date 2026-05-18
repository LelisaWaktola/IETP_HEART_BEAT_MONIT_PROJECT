/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    container: { center: true, padding: '1rem' },
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        critical: 'var(--critical)',
        warning: 'var(--warning)',
        success: 'var(--success)',
        info: 'var(--info)',
      },
      borderRadius: {
        sm: 'calc(var(--radius) - 2px)',
        DEFAULT: 'var(--radius)',
        md: 'var(--radius)',
        lg: 'calc(var(--radius) + 2px)',
        xl: 'calc(var(--radius) + 6px)',
        '2xl': 'calc(var(--radius) + 12px)',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'monospace'],
      },
      animation: {
        'slide-up': 'slide-up 0.2s ease-out forwards',
        'fade-in': 'fade-in 0.15s ease-out forwards',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};