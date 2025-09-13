import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        poppins: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Couleurs Allianz
        'allianz-500': 'var(--allianz-500)',
        'allianz-600': 'var(--allianz-600)',
        'success-500': 'var(--success-500)',
        'success-600': 'var(--success-600)',
        'warning-500': 'var(--warning-500)',
        'warning-600': 'var(--warning-600)',
        'danger-500': 'var(--danger-500)',
        'danger-600': 'var(--danger-600)',
        'info-500': 'var(--info-500)',
        'info-600': 'var(--info-600)',
      },
      boxShadow: {
        'allianz': 'var(--shadow-allianz)',
        'glass': 'var(--shadow-glass)',
      },
      borderRadius: {
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
      },
    },
  },
  plugins: [],
}

export default config
