import styled, { css } from 'styled-components';
import { darken } from 'polished';
import { Flex } from '..';
import { ThemeType } from 'renderer/theme';

interface IEmbedBox {
  theme: ThemeType;
  customBg?: string;
  customTextColor?: string;
  canHover?: boolean;
}

export const EmbedBox = styled(Flex)<IEmbedBox>`
  min-width: 320px;
  align-items: center;
  flex: 1;
  border-radius: 8px;
  img {
    margin-bottom: 0px !important;
  }
  background: ${(props: IEmbedBox) =>
    props.customBg || props.theme.colors.bg.inset};
  color: ${(props: IEmbedBox) =>
    props.customTextColor || props.theme.colors.text.primary};
  transition: ${(props: IEmbedBox) => props.theme.transition};
  ${(props: IEmbedBox) =>
    props.canHover &&
    css`
      &:hover {
        transition: ${props.theme.transition};
        background: ${darken(
          0.025,
          props.customBg || props.theme.colors.bg.inset
        )};
      }
    `}
`;
