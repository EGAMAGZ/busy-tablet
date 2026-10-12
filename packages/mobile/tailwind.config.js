import tokens from '@busy-bar/design-tokens/tailwind.config';

/** @type {import('tailwindcss').Config} */
export default {
  ...tokens,
  content: ['index.html', 'src/**/*.{ts,tsx}'],
};
