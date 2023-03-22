import { HTMLAttributes, ReactNode } from 'react';
import styled, { css } from 'styled-components';

type MenuItemStyleProps = {
  children: ReactNode;
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
  color: rgba(var(--rlm-text-rgba));

  ${({ disabled }) =>
    disabled &&
    css`
      color: rgba(var(--rlm-text-rgba), 0.7);
      background: transparent;
      opacity: 0.5;
      cursor: default;
      &:focus {
        outline: none;
        border-color: transparent;
      }
    `}

  background-color: transparent;
  &:hover:not([disabled]) {
    background-color: ${({ customBg }) =>
      customBg ? customBg : 'rgba(var(--rlm-input-rgba))'};
    backdrop-filter: brightness(96.5%);
  }
`;
