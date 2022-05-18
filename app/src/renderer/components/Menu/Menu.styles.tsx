import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { compose, space, color, typography } from 'styled-system';
import { ThemeType } from 'renderer/theme';

type MenuWrapperStyleProps = {
  customBg?: string;
  theme: ThemeType;
};

export const MenuWrapper = styled(motion.div)<MenuWrapperStyleProps>`
  z-index: 3;
  position: absolute;
  display: flex;
  margin-top: 1px;
  flex-direction: column;
  ${(props: MenuWrapperStyleProps) => css`
    background: ${props.customBg || props.theme.colors.bg.secondary};
    border: 1px solid ${props.theme.colors.ui.input.borderColor};
    transition: ${props.theme.transition};
    min-width: 125px;
    padding: 8px;
    box-shadow: ${props.theme.elevations.one};
    box-sizing: border-box;
    border-radius: ${props.theme.containers.rounderBorderRadius}px;
    color: ${props.theme.colors.text.primary};
    &:hover {
      transition: ${props.theme.transition};
      /* border-color: ${props.theme.colors.ui.input.borderHover}; */
    }
  `}
  ${compose(space, color, typography)}
`;
