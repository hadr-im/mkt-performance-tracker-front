/** @type {import('tailwindcss').Config} */

// Surfaces and ink come from CSS variables so the whole palette flips with
// the `dark` class. The triplet form keeps Tailwind's opacity modifiers
// working (bg-surface/70, border-line/50, ...).
const v = name => `rgb(var(${name}) / <alpha-value>)`;

// An accent blended into whatever the current surface is, so a "soft" badge
// reads as a pale wash in light mode and a muted one in dark mode.
const tint = hex => `color-mix(in srgb, ${hex} var(--tint), rgb(var(--c-surface)))`;

module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      xs: '400px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Fixed brand hues — identical in both themes
        brand: {
          DEFAULT: '#037EF3',
          700: v('--c-brand-ink'),
          600: v('--c-brand-ink'),
          200: '#BEDDFD',
          100: tint('#037EF3'),
          50: tint('#037EF3'),
        },
        gv: { DEFAULT: '#F85A40', ink: v('--c-gv-ink'), soft: tint('#F85A40') },
        gta: { DEFAULT: '#0CB9C1', ink: v('--c-gta-ink'), soft: tint('#0CB9C1') },
        gte: { DEFAULT: '#F48924', ink: v('--c-gte-ink'), soft: tint('#F48924') },
        good: { DEFAULT: v('--c-good-ink'), soft: tint('#0E8F5F') },

        // Theme-aware chrome
        canvas: v('--c-canvas'),
        surface: {
          DEFAULT: v('--c-surface'),
          2: v('--c-surface-2'),
          3: v('--c-surface-3'),
        },
        line: {
          DEFAULT: v('--c-line'),
          2: v('--c-line-2'),
        },
        ink: {
          DEFAULT: v('--c-ink'),
          2: v('--c-ink-2'),
          3: v('--c-ink-3'),
          4: v('--c-ink-4'),
        },
      },
      fontFamily: {
        display: ['var(--font-outfit)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['var(--font-work-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '14px', letterSpacing: '.02em' }],
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['13px', { lineHeight: '18px' }],
        base: ['15px', { lineHeight: '23px' }],
        lg: ['17px', { lineHeight: '25px' }],
        xl: ['20px', { lineHeight: '27px', letterSpacing: '-.01em' }],
        '2xl': ['24px', { lineHeight: '31px', letterSpacing: '-.015em' }],
        '3xl': ['30px', { lineHeight: '36px', letterSpacing: '-.02em' }],
        '4xl': ['38px', { lineHeight: '43px', letterSpacing: '-.022em' }],
      },
      borderRadius: {
        sm2: '8px',
        md2: '12px',
        lg2: '16px',
        xl2: '20px',
      },
      boxShadow: {
        e1: 'var(--e-1)',
        e2: 'var(--e-2)',
        e3: 'var(--e-3)',
        e4: 'var(--e-4)',
      },
      transitionTimingFunction: {
        out2: 'cubic-bezier(.22,.78,.3,1)',
      },
    },
  },
  plugins: [],
};
