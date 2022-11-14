import { FC } from 'react';
import { Flex, Icons, EmbedBox } from '..';
import styled from 'styled-components';
import { ThemeType } from 'renderer/theme';

type LinkPreviewStyleType = { theme: ThemeType; customTextColor?: string };

const LinkPreviewStyle = styled(Flex)<LinkPreviewStyleType>`
  /* border-radius: 6px; */
  height: 30px;
  padding: 2px 8px;
  flex-direction: row;
  width: 100%;
  gap: 8px;
  align-items: center;
  svg {
    fill: ${(props: LinkPreviewStyleType) => props.customTextColor};
  }

  a {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    margin: 0;
    width: calc(100% - 20px);
    text-overflow: ellipsis;
    color: ${(props: LinkPreviewStyleType) => props.customTextColor};
    a:visited {
      text-decoration: none;
      color: ${(props: LinkPreviewStyleType) => props.customTextColor};
    }
  }
`;

interface ILinkPreview {
  link: string;
  canPreview?: boolean;
  textColor?: string;
  fontSize?: number;
  customBg?: string;
  onClick?: () => void;
}

export const LinkPreview: FC<ILinkPreview> = (props: ILinkPreview) => {
  return (
    <EmbedBox canHover customBg={props.customBg}>
      <LinkPreviewStyle
        customTextColor={props.textColor}
        className="realm-cursor-hover"
        onClick={props.onClick}
      >
        <Icons name="Link" />
        <a style={{ fontSize: props.fontSize || 14 }} href={props.link}>
          {props.link}
        </a>
      </LinkPreviewStyle>
    </EmbedBox>
  );
};
