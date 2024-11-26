module.exports = {
  singleQuote: true,
  semi: false,
  plugins: [require('prettier-plugin-tailwindcss')],
  overrides: [
    {
      files: '*.tsx',
      options: {
        tabWidth: 4,
        printWidth: 120,
      },
    },
    {
      files: '*.ts',
      options: {
        tabWidth: 4,
      },
    },
  ],

  tailwindAttributes: ['theme'],
  tailwindFunctions: ['twMerge', 'createTheme'],
}
