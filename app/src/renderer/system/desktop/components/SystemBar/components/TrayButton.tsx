import { Box } from '@holium/design-system';
import { lighten, rgba } from 'polished';
import styled, { css } from 'styled-components';
import {
  color,
  ColorProps,
  compose,
  layout,
  LayoutProps,
  size,
  SizeProps,
  space,
  SpaceProps,
  typography,
} from 'styled-system';

import { ThemeType } from '../../../../../theme';

type IProps = {
  ref?: unknown;
  customBg?: string;
  theme: ThemeType;
} & SizeProps &
  ColorProps &
  LayoutProps &
  SpaceProps;

export const TrayButton = styled(Box)<IProps>`
  padding: 4px 4px;
  padding-right: 16px;
  margin-left: 3px;
  height: 38px;
  border-radius: 5px;
  /* border-radius: 6px 0px 0px 6px; */
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  user-select: none;
  gap: 8px;
  /* cursor: pointer; */
  pointer-events: auto;
  transition: ${(props: IProps) => props.theme.transition};
  ${(props: IProps) =>
    props.customBg &&
    css`
      &:hover {
        transform: translateZ(0);
        transition: ${(props: IProps) => props.theme.transition};
        background-color: ${props.customBg
          ? rgba(lighten(0.1, props.customBg), 0.4)
          : 'inherit'};
      }
    `}
  ${compose(space, size, color, layout, typography)}
`;
