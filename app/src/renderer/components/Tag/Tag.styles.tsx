import styled, { css } from 'styled-components';
import { rgba } from 'polished';

import {
  compose,
  space,
  layout,
  flexbox,
  border,
  position,
  color,
  ColorProps,
  SpaceProps,
} from 'styled-system';

import { IntentTypes } from './Tag';
import { ThemeType } from 'renderer/theme';

export type TagStyleProps = ColorProps &
  SpaceProps & {
    theme: ThemeType;
    intent: IntentTypes;
    minimal?: boolean;
    custom?: string;
    rounded?: boolean;
  };

export const TagStyle = styled(
  styled.div`
    ${(props: TagStyleProps) =>
      props.minimal
        ? css`
            background: ${(props: TagStyleProps) =>
              props.custom
                ? rgba(props.custom, 0.2)
                : rgba(props.theme.colors.ui.intent[props.intent], 0.2)};
            color: ${(props: TagStyleProps) =>
              props.custom
                ? props.custom
                : props.theme.colors.ui.intent[props.intent]};
          `
        : css`
            background: ${(props: TagStyleProps) =>
              props.theme.colors.ui.intent[props.intent]};
            color: ${(props: TagStyleProps) => props.theme.colors.text.white};
          `}
    display: flex;
    flex-direction: row;
    height: fit-content;
    align-items: center;
    width: fit-content;
    /* min-height: 18px; */
    border-radius: ${(props: TagStyleProps) =>
      props.rounded ? '12px' : `${props.theme.containers.innerBorderRadius}px`};
    padding: 4px 4px;
    font-size: 14px;
    font-weight: ${(props: TagStyleProps) => props.theme.fontWeights.medium};
  `
)<TagStyleProps>(compose(space, layout, flexbox, border, position, color));

export const TagIcon = styled(
  styled.div`
    display:flex;
    flex-direction: column;
    justify-content: center;
    margin-right: 4px;
    svg {
      width: 16px;
      height: 16px;
      path {
        ${(props: TagStyleProps) =>
          props.minimal
            ? css`
                fill:: ${(props: TagStyleProps) =>
                  props.theme.colors.ui.intent[props.intent]};
              `
            : css`
                fill:: ${(props: TagStyleProps) =>
                  props.theme.colors.text.white};
              `}
    }
  `
)<TagStyleProps>(compose(space, layout, flexbox, border, position, color));
