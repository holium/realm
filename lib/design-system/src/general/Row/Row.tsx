import { motion } from 'framer-motion';
import styled, { css } from 'styled-components';
import { Box, BoxProps } from '..';

type RowProps = {
  as?: any;
  small?: boolean;
  selected?: boolean;
  disabled?: boolean;
  pending?: boolean;
  noHover?: boolean;
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
  gap: 6px;
  color: var(--rlm-text-color);
  transition: var(--transition);

  &:active:not([disabled]) {
    transition: var(--transition);
    background-color: var(--rlm-overlay-active);
  }

  &:hover:not([disabled]) {
    transition: var(--transition);
    background-color: var(--rlm-overlay-hover);
    cursor: pointer;
  }

  &:focus:not([disabled]) {
    outline: none;
    background-color: var(--rlm-overlay-active);
    /* border: 1px solid var(--rlm-accent-color); */
  }

  &:disabled {
    opacity: 0.2;
    cursor: not-allowed !important;
    div {
      cursor: not-allowed !important;
    }
    svg {
      cursor: not-allowed !important;
    }
  }

  ${(props: RowProps) =>
    css`
      ${props.small &&
      css`
        padding: 0px 2px;
      `}
      ${props.selected &&
      css`
        background-color: var(--rlm-overlay-active);
        &:hover:not([disabled]) {
          background-color: var(--rlm-overlay-active);
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
