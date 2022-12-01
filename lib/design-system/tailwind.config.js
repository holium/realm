module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: 'var(--rlm-base-color)',
        accent: 'var(--rlm-accent-color)',
        input: 'var(--rlm-input-color)',
        border: 'var(--rlm-border-color)',
        window: 'var(--rlm-window-color)',
        card: 'var(--rlm-card-color)',
        text: 'var(--rlm-text-color)',
        icon: 'var(--rlm-icon-color)',
      },
    },
  },
  plugins: [],
};
