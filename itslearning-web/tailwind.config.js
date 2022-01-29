module.exports = {
  content: ['./public/index.html', './src/**/*.svelte'],
  theme: {
    extend: {
    },
    colors: {
      'background': '#f4f4f4',
      'background-dark': '#242424',
      'background-hover': 'rgb(229 229 229)',
      'background-hover-dark': 'rgb(82 82 82)',
      'background-highlight': 'rgb(255 255 255)',
      'background-highlight-hover': 'rgb(235 235 235)',
      'background-highlight-active': 'rgb(225 225 225)',
      'background-highlight-dark': 'rgb(48 48 48)',
      'background-highlight-hover-dark': 'rgb(58 58 58)',
      'background-highlight-active-dark': 'rgb(68 68 68)',
      'decoration-faint': 'rgb(212 212 212)',
      'decoration-faint-dark': 'rgb(48 48 48)',
      'decoration-normal': 'rgb(115 115 115)',
      'decoration-normal': 'rgb(115 115 115)',
      'foreground': 'rgb(56 56 56)',
      'foreground-dark': 'rgb(229 229 229)',
      'white': 'rgb(255 255 255)',
      'black': 'rgb(0 0 0)',
      'green': '#008859',
      'green-hover': '#009869',
      'green-active': '#00a879',
      'inherit': 'inherit'
    }
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
  darkMode: 'class',
  important: true,
}
