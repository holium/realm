import styled from 'styled-components';
import { compose, space, SpaceProps } from 'styled-system';
import { rgba } from 'polished';
import { ThemeType } from 'renderer/theme';

type IProps = {
  theme: ThemeType;
} & SpaceProps;

export const Divider = styled.div<IProps>`
  display: inline-block;
  width: 2px;
  background-color: ${(props: IProps) =>
    rgba(props.theme.colors.bg.divider, 0.2)};
  margin: 0 16px;
  border-radius: 6px;
  height: 1.3em;
  ${compose(space)}
`;

Divider.defaultProps = {
  ml: 4,
  mr: 4,
};
