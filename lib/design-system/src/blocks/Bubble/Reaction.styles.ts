import styled, { css } from 'styled-components';

import { Box, Text } from '../../../general';
import { opacifyHexColor } from '../../util/colors';
import { FontSizes, REACTION_WIDTH, ReactionSizes } from './Reaction.sizes';

export const ReactionRow = styled(Box)<{ variant: 'overlay' | 'inline' }>`
  display: flex;
  position: relative;
  flex-direction: row;
  width: 100%;
  max-width: ${REACTION_WIDTH}px;
  flex-wrap: wrap;
  gap: 2px;
  z-index: 15;
  .emoji-picker-menu {
    &:hover {
      .bubble-reactions {
        transition: var(--transition);
        opacity: 1;
      }
    }
  }
  ${({ variant }) =>
    variant === 'overlay'
      ? css`
          position: absolute;
          left: 0px;
          bottom: -8px;
        `
      : css`
          flex-direction: row;
        `}
`;

type ReactionButtonProps = {
  hasCount?: boolean;
  isOur?: boolean;
  size?: keyof typeof ReactionSizes;
  ourColor?: string;
  selected?: boolean;
};

export const ReactionButton = styled(Box)<ReactionButtonProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  color: rgba(var(--rlm-text-rgba));
  background: ${({ selected, ourColor }) =>
    selected
      ? ourColor
        ? opacifyHexColor(ourColor, 0.3)
        : 'gba(var(--rlm-accent-rgba))'
      : 'rgba(0, 0, 0, 0.08)'};
  box-shadow: ${({ selected }) =>
    selected
      ? 'inset 0px 0px 0px 1px rgba(0, 0, 0, 0.1)'
      : 'inset 0px 0px 0px 1px rgba(0, 0, 0, 0.15)'};

  /* TODO merged from master */
  /* background: ${({ selected }) =>
    selected ? 'rgba(var(--rlm-accent-rgba))' : 'rgba(var(--rlm-input-rgba))'};
  filter: ${({ selected }) => (selected ? 'brightness(1.3)' : 'brightness(1)')};
  border: ${({ selected }) =>
    selected
      ? '1px solid rgba(var(--rlm-accent-rgba))'
      : '1px solid rgba(var(--rlm-window-rgba))'}; */

  border-radius: 16px;
  transition: var(--transition);
  ${({ size, selected, isOur }) =>
    size
      ? css`
          min-width: ${ReactionSizes[size]}px;
          height: ${ReactionSizes[size]}px;
          ${Text.Hint} {
            font-size: ${FontSizes[size]}px;
            ${selected && !isOur && 'color: rgba(var(--rlm-text-rgba));'}
            ${selected && isOur && 'color: #FFF;'}
            /* ${selected && 'color: rgba(var(--rlm-accent-rgba));'} */
          }
        `
      : css`
          min-width: 24px;
          height: 24px;
        `}

  width: auto;
  img {
    user-select: none;
    pointer-events: none;
  }
  div {
    user-select: none;
    pointer-events: none;
  }
  ${({ hasCount, size }: ReactionButtonProps) =>
    hasCount &&
    size &&
    css`
      min-width: ${ReactionSizes[size]}px;
      transition: 0.01s ease-in-out;
      padding: 0 6px 0 4px;
      gap: 4px;
    `}

  &:hover {
    transition: var(--transition);
    cursor: pointer;
    filter: brightness(0.96);
  }
  ${({ isOur, ourColor, selected }) =>
    isOur &&
    ourColor &&
    css`
      background: ${ourColor};
      filter: brightness(0.9);
      border-color: rgba(var(--rlm-accent-rgba));
      transition: var(--transition);
      &:hover {
        transition: var(--transition);
        filter: brightness(0.875);
      }

        ${
          selected &&
          css`
            filter: brightness(0.8);
            &:hover {
              filter: brightness(0.775);
            }
          `
        }}
    `}
`;
