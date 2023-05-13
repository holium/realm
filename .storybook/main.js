const path = require('path');

module.exports = {
  webpackFinal: async (config) => {
    const modules = [
      path.resolve(__dirname, '../app/src'),
      path.resolve(__dirname, '../shared/src'),
      path.resolve(__dirname, '../hosting-holium-com/src'),
      path.resolve(__dirname, '../lib/design-system/src'),
      path.resolve(__dirname, '../lib/presence/src'),
    ];

    config.resolve.modules.push(...modules);

    return config;
  },

  stories: [
    '../app/src/**/*.stories.@(js|jsx|ts|tsx)',
    '../shared/src/**/*.stories.@(js|jsx|ts|tsx)',
    '../hosting-holium-com/src/**/*.stories.@(js|jsx|ts|tsx)',
    '../lib/design-system/src/**/*.stories.@(js|jsx|ts|tsx)',
    '../lib/presence/src/**/*.stories.@(js|jsx|ts|tsx)',
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
