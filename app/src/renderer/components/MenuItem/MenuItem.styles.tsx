import { HTMLAttributes, ReactNode } from 'react';
import { darken, rgba } from 'polished';
import styled, { css } from 'styled-components';
import type { ThemeType } from '../../theme';

type MenuItemStyleProps = {
  children: ReactNode;
  theme: ThemeType;
  color?: string;
  customBg?: string;
  selected?: boolean;
  disabled?: boolean;
} & HTMLAttributes<HTMLLIElement>;

export const MenuItemStyle = styled.li<MenuItemStyleProps>`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex: 1;
  flex-direction: row;
  background: inherit;
  -webkit-box-sizing: border-box; /* Safari/Chrome, other WebKit */
  -moz-box-sizing: border-box; /* Firefox, other Gecko */
  box-sizing: border-box; /* Opera/IE 8+ */
  padding: 8px;
  font-size: 14px;
  border-radius: ${(props) => props.theme.containers.outerBorderRadius}px;
  transition: ${(props) => props.theme.transition};
  svg {
    fill: currentcolor;
  }
  pointer-events: auto;
  user-select: none;

  ${({ disabled, theme }) =>
    !disabled
      ? /* Enabled */
        css`
          &:hover:not([disabled]) {
            transition: ${theme.transition};
          }
        `
      : /* Disabled */
        css`
          -webkit-text-fill-color: currentColor; /* set text fill to current color for safari */
          color: ${rgba(theme.colors.text.disabled, 0.7)};
          border-color: ${theme.colors.ui.disabled};
          opacity: 0.5;
          cursor: default;
          &:focus {
            outline: none;
            border-color: transparent;
          }
          background: transparent;
        `}

  ${({ color, disabled }) =>
    color &&
    css`
      color: ${disabled ? rgba(color, 0.7) : color};
    `}

  ${({ customBg }) =>
    customBg &&
    css`
      background-color: transparent;
      &:hover:not([disabled]) {
        background-color: ${darken(0.035, customBg)};
      }
    `} // Cast as react component
`;

export default MenuItemStyle;
