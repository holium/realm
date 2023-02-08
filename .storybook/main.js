module.exports = {
  stories: [
    "../app/src/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    "../lib/design-system/src/**/*.stories.@(js|jsx|ts|tsx|mdx)"
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@etchteam/storybook-addon-css-variables-theme',
  ],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-webpack5',
  },
};
