import styled, { css } from 'styled-components';
import { Flex } from '..';

interface IEmbedBox {
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
  background: rgba(var(--rlm-window-rgba));
  backdrop-filter: brightness(97%) blur(6px);
  color: ${(props: IEmbedBox) =>
    props.customTextColor || 'rgba(var(--rlm-text-rgba))'};
  transition: var(--transition);
  ${(props: IEmbedBox) =>
    props.canHover &&
    css`
      &:hover {
        transition: var(--transition);
        backdrop-filter: brightness(94%) blur(6px);
      }
    `}
`;
