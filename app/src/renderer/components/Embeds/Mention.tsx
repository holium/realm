import { FC } from 'react';
import { ThemeType } from 'renderer/theme';
import { rgba } from 'polished';
import styled from 'styled-components';
import { Flex } from '..';

interface IMentionStyle {
  theme: ThemeType;
  textColor?: string;
  height?: number;
}

const MentionStyle = styled.span<IMentionStyle>`
  padding: 0px 4px;
  border-radius: 4px;
  align-items: center;
  /* height: ${(props: IMentionStyle) => `${props.height}px` || 'inherit'}; */
  font-size: ${(props: IMentionStyle) => props.theme.fontSizes[2]};
  color: ${(props: IMentionStyle) =>
    props.textColor || props.theme.colors.brand.primary};
  background: ${(props: IMentionStyle) =>
    props.textColor
      ? rgba(props.textColor, 0.2)
      : rgba(props.theme.colors.brand.primary, 0.1)};
`;

interface IMention {
  patp: string;
  color?: string;
  blended?: boolean;
  mb?: number;
  height?: number;
}

export const Mention: FC<IMention> = (props: IMention) => {
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      height={props.height || 'inherit'}
    >
      <MentionStyle
        style={{ marginBottom: props.mb || 0 }}
        textColor={props.color}
        className="realm-cursor-hover"
      >
        {`~${props.patp.replace('~', '')}`}
      </MentionStyle>
    </Flex>
  );
};
