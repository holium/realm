import cssVariablesTheme from '@etchteam/storybook-addon-css-variables-theme';
import light from '!!style-loader?injectType=lazyStyleTag!css-loader!./mock-themes/light.css';
import dark from '!!style-loader?injectType=lazyStyleTag!css-loader!./mock-themes/dark.css';

export const decorators = [cssVariablesTheme];

export const parameters = {
  layout: 'fullscreen',
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  cssVariables: {
    files: {
      'Light theme': light,
      'Dark theme': dark,
    },
    defaultTheme: 'Light theme',
  },
};
