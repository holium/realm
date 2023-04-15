import { motion } from 'framer-motion';
import { darken, rgba } from 'polished';
import { ThemeType } from 'renderer/theme';
import styled, { css } from 'styled-components';
import { color, compose, space, typography } from 'styled-system';

interface MenuWrapperStyleProps {
  customBg?: string;
  theme: ThemeType;
}

export const MenuWrapper = styled(motion.div)<MenuWrapperStyleProps>`
  z-index: 1000;
  position: absolute;
  display: flex;
  margin-top: 1px;
  flex-direction: column;
  backdrop-filter: var(--blur);
  ${(props: MenuWrapperStyleProps) => css`
    background: ${props.customBg || props.theme.colors.bg.secondary};
    border: 1px solid ${props.theme.colors.ui.input.borderColor};
    --webkit-transition: ${props.theme.transition};
    min-width: 125px;
    padding: 8px;
    box-shadow: ${props.theme.elevations.two};
    box-sizing: border-box;
    border-radius: 9px;
    color: ${props.theme.colors.text.primary};
    &:hover {
      transition: ${props.theme.transition};
    }
    hr {
      height: 1px;
      background-color: ${(props: MenuWrapperStyleProps) =>
        props.customBg
          ? darken(0.05, props.customBg)
          : rgba(props.theme.colors.bg.divider, 0.5)};
      border: none;
      width: 80%;
      border-radius: 50%;
      margin-block-end: 0.35em;
      margin-block-start: 0.35em;
    }
  `}
  ${compose(space, color, typography)}
`;
