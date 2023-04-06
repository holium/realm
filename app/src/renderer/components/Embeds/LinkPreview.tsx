import { FC } from 'react';
import { EmbedBox } from '..';
import styled from 'styled-components';
import { Flex, Icon } from '@holium/design-system';

const LinkPreviewStyle = styled(Flex)`
  /* border-radius: 6px; */
  height: 30px;
  padding: 2px 8px;
  flex-direction: row;
  width: 100%;
  gap: 8px;
  align-items: center;
  svg {
    fill: rgba(var(--rlm-text-rgba), 0.5);
  }
  a {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    margin: 0;
    width: calc(100% - 20px);
    text-overflow: ellipsis;
    color: rgba(var(--rlm-accent-rgba), 0.8);
    a:visited {
      text-decoration: none;
      color: rgba(var(--rlm-accnet-rgba));
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
    <EmbedBox canHover>
      <LinkPreviewStyle className="realm-cursor-hover" onClick={props.onClick}>
        <Icon name="Link" />
        <a style={{ fontSize: props.fontSize || 14 }} href={props.link}>
          {props.link}
        </a>
      </LinkPreviewStyle>
    </EmbedBox>
  );
};
