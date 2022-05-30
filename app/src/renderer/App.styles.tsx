import { createGlobalStyle } from 'styled-components';
import { ThemeType } from './theme';

type StyleProps = {
  theme: ThemeType;
  blur: boolean;
};

export const GlobalStyle = createGlobalStyle<StyleProps>`
  * {
    box-sizing: border-box;
    cursor: none !important;
    font-family: "Rubik", sans-serif;
      // --webkit-backface-visibility: hidden;
      // --webkit-transform: translate3d(0, 0, 0);
      // --webkit-perspective: 1000;
  }
  
  :root {
    --blur-enabled: ${(props: StyleProps) =>
      props.blur ? 'blur(16px)' : 'none'};
  }
  
  body {
    color: ${(props) => props.theme.colors.text.primary};
    height: 100vh;
    width: 100vw;
    margin: 0;
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
