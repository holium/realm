import { HTMLAttributes, ReactNode } from 'react';
import { darken, rgba } from 'polished';
import styled, { css } from 'styled-components';
import { getVar } from '../../util/colors';

type MenuItemStyleProps = {
  children: ReactNode;
  color?: string;
  customBg?: string;
  selected?: boolean;
  disabled?: boolean;
} & HTMLAttributes<HTMLLIElement>;

export const MenuItemStyle = styled.li<MenuItemStyleProps>`
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  background: inherit;
  padding: 8px;
  font-size: 14px;
  border-radius: var(--rlm-border-radius-4);
  transition: var(--transition);
  pointer-events: auto;
  user-select: none;
  color: var(--rlm-text-color);

  ${({ disabled }) =>
    disabled &&
    css`
      color: ${rgba(getVar('text'), 0.7)};
      background: transparent;
      opacity: 0.5;
      cursor: default;
      &:focus {
        outline: none;
        border-color: transparent;
      }
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
    `}
`;
