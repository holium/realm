// import styled from 'styled-components';
// import { rgba } from 'polished';
// import {
//   compose,
//   space,
//   layout,
//   flexbox,
//   border,
//   position,
//   color,
//   BorderProps,
//   SpaceProps,
// } from 'styled-system';
// import type { ThemeType } from './theme';

// export type AppDockStyleProps = BorderProps &
//   SpaceProps & {
//     theme: ThemeType;
//     baseColor?: string;
//   };

// export const AppDockStyle = styled(
//   styled.div`
//     display: inline-flex;
//     flex-direction: row;
//     align-items: center;
//     font-family: Inter;
//     font-style: normal;
//     font-weight: 500;
//     font-size: 14px;
//     height: 30px;
//     padding: 4px 8px;
//     border-radius: 30px;
//     svg {
//       height: 18px;
//       width: 18px;
//     }
//     user-select: none;
//     cursor: pointer;
//     transition: ${(props: AppDockStyleProps) => props.theme.transition};
//     background: ${(props: AppDockStyleProps) =>
//       rgba(props.baseColor || props.theme.colors.os.base, 0.08)};
//     color: ${(props: AppDockStyleProps) =>
//       props.baseColor || rgba(props.theme.colors.os.base, 0.6)};
//     /*  */
//     /* &:hover {
//       background: ${(props: AppDockStyleProps) =>
//       rgba(props.baseColor || props.theme.colors.os.base, 0.12)};
//       transition: ${(props: AppDockStyleProps) =>
//       props.baseColor || props.theme.transition};
//     } */
//   `
// )<AppDockStyleProps>(compose(space, layout, flexbox, border, position, color));

// export const DockDivider = styled(
//   styled.div`
//     height: 16px;
//     width: 1px;
//     margin: 0 4px;
//     border-right: 1px solid
//       ${(props: AppDockStyleProps) => rgba(props.theme.colors.os.base, 0.12)};
//   `
// )<AppDockStyleProps>(compose(space, layout, flexbox, border, position, color));
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
