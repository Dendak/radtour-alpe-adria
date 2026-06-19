/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
      },
      colors: {
        // barvy etap: z Alp (modrá) k Jadranu (oranžová)
        day1: '#1d4ed8', // alpská modrá — Gasteinertal
        day2: '#0891b2', // ledovcová tyrkysová — Tauernschleuse + Drávа
        day3: '#16a34a', // furlanská zeleň — Kanaltal
        day4: '#ea580c', // jadranská oranžová — k moři
        day5: '#e11d48', // korálová — odpočinek u moře
        sea: '#0e7490',
        ink: '#0f1b2a', // chladná tmavá
        paper: '#f6f8fb', // chladná světlá
      },
      backgroundImage: {
        'hero-fallback':
          'radial-gradient(1000px 520px at 18% 0%, rgba(29,78,216,0.42), transparent 60%), radial-gradient(900px 520px at 88% 8%, rgba(234,88,12,0.34), transparent 55%), linear-gradient(180deg, #0b1220 0%, #0f1b2a 100%)',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,23,42,0.04), 0 6px 16px -8px rgba(15,23,42,0.10)',
        card: '0 1px 3px rgba(15,23,42,0.05), 0 12px 28px -14px rgba(15,23,42,0.18)',
        lift: '0 8px 20px -6px rgba(15,23,42,0.14), 0 24px 48px -18px rgba(15,23,42,0.22)',
        nav: '0 1px 0 rgba(15,23,42,0.06), 0 8px 30px -16px rgba(15,23,42,0.25)',
      },
      letterSpacing: {
        tightest: '-0.03em',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        kenburns: {
          '0%': { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1.14)' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(6px)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp .6s ease-out both',
        kenburns: 'kenburns 22s ease-out forwards',
        floaty: 'floaty 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
