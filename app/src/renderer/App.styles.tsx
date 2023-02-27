import { darken, rgba, lighten } from 'polished';
import { createGlobalStyle, css } from 'styled-components';
import { ThemeType } from './logic/theme';
import { ThemeType as OldTheme } from './theme';

interface StyleProps {
  theme: OldTheme;
  realmTheme: ThemeType;
  blur: boolean;
}

export const GlobalStyle = createGlobalStyle<StyleProps>`
  :root {
    ${(props: StyleProps) => css`
      --blur: ${props.blur ? 'blur(24px)' : 'none'};
      --transition-fast: 0.4s ease;
      --transition: all 0.25s ease;
      --transition-2x: all 0.5s ease;
      --rlm-border-radius-4: 4px;
      --rlm-border-radius-6: 6px;
      --rlm-border-radius-9: 9px;
      --rlm-border-radius-12: 12px;
      --rlm-border-radius-12: 16px;
      --rlm-box-shadow-1: 0px 0px 4px rgba(0, 0, 0, 0.06);
      --rlm-box-shadow-2: 0px 0px 9px rgba(0, 0, 0, 0.12);
      --rlm-box-shadow-3: 0px 0px 9px rgba(0, 0, 0, 0.18);
      --rlm-box-shadow-lifted: 0px 0px 9px rgba(0, 0, 0, 0.24);
    `}
  }

  ${(props) => css`
    :root {
      --rlm-font: 'Rubik', sans-serif;
      --rlm-home-button-color: ${props.realmTheme.mode === 'light'
        ? rgba(darken(0.2, props.realmTheme.dockColor), 0.5)
        : rgba(darken(0.15, props.realmTheme.dockColor), 0.6)};
      --rlm-base-color: ${props.realmTheme.backgroundColor};
      --rlm-accent-color: ${props.realmTheme.accentColor};
      --rlm-input-color: ${props.realmTheme.inputColor};
      --rlm-border-color: ${props.realmTheme.mode === 'dark'
        ? lighten(0.07, props.realmTheme.windowColor)
        : darken(0.1, props.realmTheme.windowColor)};
      --rlm-window-color: ${props.realmTheme.windowColor};
      --rlm-window-bg: ${rgba(props.realmTheme.windowColor, 0.9)};
      --rlm-dock-color: ${rgba(props.realmTheme.windowColor, 0.65)};
      --rlm-card-color: ${props.realmTheme.windowColor};
      --rlm-theme-mode: ${props.realmTheme.mode};
      --rlm-text-color: ${props.realmTheme.textColor};
      --rlm-icon-color: ${rgba(props.realmTheme.textColor, 0.7)};
      --rlm-intent-alert-color: #ff6240;
      --rlm-intent-caution-color: #ffbc32;
      --rlm-intent-success-color: #0fc383;
      --rlm-overlay-hover: ${props.realmTheme.mode === 'light'
        ? 'rgba(0, 0, 0, 0.04)'
        : 'rgba(255, 255, 255, 0.06)'};
      --rlm-overlay-active: ${props.realmTheme.mode === 'light'
        ? 'rgba(0, 0, 0, 0.06)'
        : 'rgba(255, 255, 255, 0.09)'};
    }
  `}

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
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

  body {
    background-color: var(--rlm-window-color);
    transition: background-color 1s ease;
    color:var(--rlm-text-color);
    height: 100vh;
    width: 100vw;
    margin: 0;
    overflow: hidden; 
    position: relative;
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

  /* a {
    text-decoration: none;
    height: fit-content;
    width: fit-content;
    margin: 10px;
  } */

  fieldset {
    border: 0;
  }

`;
