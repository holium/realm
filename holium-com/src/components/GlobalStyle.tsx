import { createGlobalStyle, css } from 'styled-components';

import { genCSSVariables, ThemeType } from '@holium/shared';

type Props = {
  theme: ThemeType;
};

export const GlobalStyle = createGlobalStyle<Props>`
  ${({ theme }) =>
    css`
      ${genCSSVariables(theme)}
    `}
`;
