import styled, { css } from 'styled-components';
import { Button } from '../';

interface RowProps {
  small?: boolean;
  selected?: boolean;
  disabled?: boolean;
  pending?: boolean;
  noHover?: boolean;
}

export const Row = styled(Button.Base)<RowProps>`
  border-radius: 6px;
  width: 100%;
  padding: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: transparent;
  gap: 6px;
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
    cursor: not-allowed;
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
  onMouseOut: (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.currentTarget.blur();
  },
};
