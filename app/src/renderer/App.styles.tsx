import { darken } from 'polished';
import { createGlobalStyle, css } from 'styled-components';
import { ThemeType } from './logic/theme';
import { ThemeType as OldTheme } from './theme';

interface StyleProps {
  theme: OldTheme;
  realmTheme: ThemeType;
  blur: boolean;
}

export const GlobalStyle = createGlobalStyle<StyleProps>`
  * {
    box-sizing: border-box;
    cursor: none !important;
    font-family: "Rubik", sans-serif;

  }

  #root{ 
    height: inherit;
    width: inherit;
  }

  /* Scroll bar stylings */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    
  }

  /* Track */
  ::-webkit-scrollbar-track {
    border-radius: 4px;
    margin-top: 4px;
    margin-bottom: 4px;
    background: ${(props) => darken(0.02, props.realmTheme.windowColor)}; 
  }
  
  /* Handle */
  ::-webkit-scrollbar-thumb {
    width: 6px;
    background: ${(props) => darken(0.08, props.realmTheme.windowColor)}; 
    border-radius: 5px;
    transition: .25s ease;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    transition: .25s ease;
    background: ${(props) => darken(0.1, props.realmTheme.windowColor)}; 
  }
  :root {
    ${(props: StyleProps) => css`
      --blur-enabled: ${props.blur ? 'blur(24px)' : 'none'};
      --border-color: ${props.theme.colors.ui.borderColor};
      --background-color: ${props.theme.colors.bg.primary};
      --transition-fast: ${props.theme.transitionFast};
      --transition: ${props.theme.transition};
      --text-color: ${props.theme.colors.text.primary};
    `}
  }

  body {
    background-color: ${(props) => props.theme.colors.bg.body};
    transition: background-color 1s ease;
    color: ${(props) => props.theme.colors.text.primary};
    height: 100vh;
    width: 100vw;
    margin: 0;
    overflow: hidden; 
  }

  li {
    list-style: none;
  }

  ul {
    margin-block-start: 0em;
    margin-block-end: 0em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    padding-inline-start: 0px;
  }

  a {
    text-decoration: none;
    height: fit-content;
    width: fit-content;
    margin: 10px;
  }

  fieldset {
    border: 0;
  }

`;

export default { GlobalStyle };
