import { motion } from 'framer-motion';
import styled, { css } from 'styled-components';
import { Box, BoxProps } from '../../../general';

type RowProps = {
  as?: any;
  gap?: string;
  small?: boolean;
  selected?: boolean;
  disabled?: boolean;
  pending?: boolean;
  noHover?: boolean;
  backgroundColor?: string;
  onClick?: (evt: React.MouseEvent<HTMLDivElement>) => void;
} & BoxProps;

export const Row = styled(Box)<RowProps>`
  border: 1px solid transparent;
  border-radius: 6px;
  width: 100%;
  padding: 8px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  background-color: transparent;
  box-sizing: border-box;
  appearance: none;
  flex-basis: initial;
  gap: ${(props: RowProps) => props.gap || '6px'};
  color: rgba(var(--rlm-text-rgba));
  transition: var(--transition);

  &:active:not([disabled]) {
    background-color: rgba(var(--rlm-overlay-active-rgba));
    ${({ backgroundColor }) =>
      backgroundColor &&
      css`
        background-color: ${backgroundColor};
        backdrop-filter: brightness(0.8);
      `}
  }

  &:hover:not([disabled]) {
    background-color: rgba(var(--rlm-overlay-active-rgba));
    ${({ backgroundColor }) =>
      backgroundColor &&
      css`
        background-color: ${backgroundColor};
        backdrop-filter: brightness(0.9);
      `}
    cursor: pointer;
  }

  &:focus:not([disabled]) {
    outline: none;
    background-color: rgba(var(--rlm-overlay-active-rgba));
    ${({ backgroundColor }) =>
      backgroundColor &&
      css`
        background-color: ${backgroundColor};
        backdrop-filter: brightness(0.9);
      `}
  }

  &:disabled {
    opacity: 0.2;
  }

  ${(props) =>
    css`
      ${props.small &&
      css`
        padding: 0px 2px;
      `}
      ${props.selected &&
      css`
        background-color: rgba(var(--rlm-overlay-active-rgba));
        &:hover:not([disabled]) {
          background-color: rgba(var(--rlm-overlay-active-rgba));
        }
      `}
      ${props.noHover &&
      css`
        background-color: transparent;
        &:hover:not([disabled]) {
          background-color: transparent;
        }
      `}
    `}
`;

Row.defaultProps = {
  as: motion.fieldset,
  fontSize: 1,
  onMouseOut: (evt: React.MouseEvent<HTMLDivElement>) => {
    evt.currentTarget.blur();
  },
};
