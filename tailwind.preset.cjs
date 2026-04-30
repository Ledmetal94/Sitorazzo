/* ============================================================
   SITORAZZO — TAILWIND PRESET
   Estende Tailwind con i token brand (colori, font, spacing, motion).
   Uso: nel tailwind.config del sito → presets: [require('./Design System/tailwind.preset.cjs')]
   ============================================================ */

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        sr: {
          yellow:      '#FFD60A',
          'yellow-d':  '#F5B700',
          ink:         '#0A0A0A',
          'ink-70':    '#3D3D3D',
          'ink-40':    '#8A8A8A',
          warm:        '#FFF8E7',
          paper:       '#FFFFFF',
          border:      '#E5E5E5',
          success:     '#22C55E',
          alert:       '#EF4444',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"Inter Display"', 'system-ui', 'sans-serif'],
        body:    ['"Inter"', '"Manrope"', 'system-ui', 'sans-serif'],
        mono:    ['"Space Mono"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl':  ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-lg':  ['3.75rem', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md':  ['3rem',    { lineHeight: '1.1',  letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      letterSpacing: {
        'sr-tight': '-0.02em',
        'sr-wide':  '0.05em',
      },
      borderRadius: {
        'sr-sm':   '4px',
        'sr-md':   '8px',
        'sr-lg':   '12px',
        'sr-xl':   '16px',
        'sr-2xl':  '24px',
      },
      boxShadow: {
        'sr-sm':   '0 2px 4px rgba(10,10,10,0.06), 0 1px 2px rgba(10,10,10,0.04)',
        'sr-md':   '0 4px 8px rgba(10,10,10,0.08), 0 2px 4px rgba(10,10,10,0.04)',
        'sr-lg':   '0 12px 24px rgba(10,10,10,0.10), 0 4px 8px rgba(10,10,10,0.05)',
        'sr-xl':   '0 24px 48px rgba(10,10,10,0.14), 0 8px 16px rgba(10,10,10,0.06)',
        'sr-glow': '0 0 0 4px rgba(255,214,10,0.20), 0 8px 24px rgba(255,214,10,0.35)',
      },
      transitionTimingFunction: {
        'sr-out':    'cubic-bezier(0.22, 1, 0.36, 1)',
        'sr-in':     'cubic-bezier(0.64, 0, 0.78, 0)',
        'sr-in-out': 'cubic-bezier(0.83, 0, 0.17, 1)',
        'sr-launch': 'cubic-bezier(0.16, 0.84, 0.44, 1)',
        'sr-snap':   'cubic-bezier(0.6, -0.28, 0.74, 0.05)',
      },
      transitionDuration: {
        'sr-instant': '100ms',
        'sr-fast':    '200ms',
        'sr-normal':  '300ms',
        'sr-slow':    '500ms',
        'sr-rocket':  '1200ms',
      },
      maxWidth: {
        'sr-sm':  '640px',
        'sr-md':  '768px',
        'sr-lg':  '1024px',
        'sr-xl':  '1280px',
        'sr-2xl': '1440px',
      },
      keyframes: {
        'sr-launch': {
          '0%':   { transform: 'translate(-40px, 40px) rotate(-15deg) scale(0.6)', opacity: '0' },
          '40%':  { transform: 'translate(0, 0) rotate(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translate(0, 0) rotate(0) scale(1)', opacity: '1' },
        },
        'sr-spark': {
          '0%':   { transform: 'translate(-20px, 20px) scale(0)', opacity: '0' },
          '50%':  { transform: 'translate(0, 0) scale(1)', opacity: '1' },
          '100%': { transform: 'translate(8px, -8px) scale(0)', opacity: '0' },
        },
        'sr-reveal': {
          '0%':   { clipPath: 'inset(0 100% 0 0)', opacity: '0' },
          '100%': { clipPath: 'inset(0 0 0 0)', opacity: '1' },
        },
      },
      animation: {
        'sr-launch':  'sr-launch 1.2s cubic-bezier(0.16, 0.84, 0.44, 1) forwards',
        'sr-spark':   'sr-spark 0.6s ease-out forwards',
        'sr-reveal':  'sr-reveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.4s forwards',
      },
    },
  },
};
