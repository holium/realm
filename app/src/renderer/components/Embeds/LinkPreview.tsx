import { FC } from 'react';
import { Flex, Icons, EmbedBox } from '..';
import styled from 'styled-components';
import { ThemeType } from 'renderer/theme';

const LinkPreviewStyle = styled(Flex)`
  /* border-radius: 6px; */
  height: 30px;
  padding: 2px 8px;
  flex-direction: row;
  width: 100%;
  gap: 8px;
  align-items: center;
  /* background: ${(props: { theme: ThemeType }) =>
    props.theme.colors.ui.tertiary}; */
  svg {
    fill: ${(props: { theme: ThemeType }) => props.theme.colors.text.tertiary};
  }

  a {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    margin: 0;
    width: calc(100% - 20px);
    text-overflow: ellipsis;
    font-size: 14px;
    color: ${(props: { theme: ThemeType }) => props.theme.colors.text.tertiary};
  }
`;

interface ILinkPreview {
  link: string;
  canPreview?: boolean;
}

export const LinkPreview: FC<ILinkPreview> = (props: ILinkPreview) => {
  return (
    <EmbedBox canHover>
      <LinkPreviewStyle className="realm-cursor-hover">
        <Icons name="Link" />
        <a href={props.link}>{props.link}</a>
      </LinkPreviewStyle>
    </EmbedBox>
  );
};
