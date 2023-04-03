import { AnimatePresence } from 'framer-motion';
import { darken } from 'polished';
import { useMemo } from 'react';
import { createGlobalStyle, css } from 'styled-components';
import { genCSSVariables } from './logic/theme';
import { ThemeType } from './stores/models/theme.model';
import { BackgroundImage } from './system/system.styles';
import { ThemeType as OldTheme } from './theme';

interface StyleProps {
  theme: OldTheme;
  realmTheme: ThemeType;
  blur: boolean;
}

export const GlobalStyle = createGlobalStyle<StyleProps>`
  ${(props) =>
    css`
      ${genCSSVariables(props.realmTheme)}
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
    background-color: rgba(var(--rlm-base-rgba));
    transition: background-color 1s ease;
    color: rgba(var(--rlm-text-rgba));
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

  fieldset {
    border: 0;
  }
`;

export const BgImage = ({
  blurred,
  wallpaper,
}: {
  blurred: boolean;
  wallpaper: string;
}) => {
  return useMemo(
    () => (
      <AnimatePresence>
        <BackgroundImage
          key={wallpaper}
          src={wallpaper}
          initial={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          animate={{
            opacity: 1,
            filter: blurred ? `blur(24px)` : 'blur(0px)',
          }}
          transition={{
            opacity: { duration: 0.5 },
          }}
        />
      </AnimatePresence>
    ),
    [blurred, wallpaper]
  );
};
