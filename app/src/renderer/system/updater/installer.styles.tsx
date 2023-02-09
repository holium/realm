import { createGlobalStyle, css } from 'styled-components';

type InstallerStyleProps = {
  hideCursor?: boolean;
};
export const InstallerStyle = createGlobalStyle<InstallerStyleProps>`
  :root {
    font-family: 'Rubik', system-ui, sans-serif;
    color: var(--rlm-text-color);
    overflow-y: hidden;
    --theme-mode: 'light';
    --blur: blur(24px);
    --transition: all 0.25s ease;
    --transition-slow: all 0.5s ease;
    --rlm-font: 'Rubik', system-ui, sans-serif;
    --rlm-base-color: #c4c3bf;
    --rlm-accent-color: #4e9efd;
    --rlm-input-color: #f5f5f4;
    --rlm-border-color: #ddddda;
    --rlm-window-color: #ffffff;
    --rlm-dock-color: #f5f5f475;
    --rlm-card-color: #f5f5f4;
    --rlm-theme-mode: light;
    --rlm-text-color: #2a2927;
    --rlm-icon-color: #333333;
    --rlm-intent-alert-color: #e82a00;
    --rlm-intent-caution-color: #ffbc32;
    --rlm-intent-success-color: #0fc383;
    --rlm-border-radius-4: 4px;
    --rlm-border-radius-6: 6px;
    --rlm-border-radius-9: 9px;
    --rlm-border-radius-12: 12px;
    --rlm-border-radius-12: 16px;
    --rlm-overlay-hover: rgba(0, 0, 0, 0.05);
    --rlm-overlay-active: rgba(0, 0, 0, 0.09);
  }
  html {
    background: var(--rlm-window-color);
    font-family: var(--rlm-font);
  }
  ${(props) =>
    props.hideCursor &&
    css`
      * {
        cursor: none !important;
      }
    `}
`;
