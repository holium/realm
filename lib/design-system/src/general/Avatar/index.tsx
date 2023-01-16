import { FC } from 'react';
import { sigil, reactRenderer } from '@tlon/sigil-js';
import styled, { css } from 'styled-components';
import { Box, BoxProps } from '../..';
import { motion } from 'framer-motion';
import { BorderRadiusProps } from 'styled-system';

export type AvatarStyleProps = BoxProps &
  BorderRadiusProps & {
    clickable?: boolean;
    active?: boolean;
    sigilColor?: string;
    sigilSize?: number;
    overlayBorder?: string;
    borderRadiusOverride?: string;
    raised?: boolean;
    theme: any;
  };

export const AvatarWrapper = styled(Box)<AvatarStyleProps>`
  overflow: hidden;
  box-sizing: content-box;
  pointer-events: none;
  border-radius: var(--rlm-border-radius-4);
  img {
    user-select: none;
    pointer-events: none;
    background: var(--rlm-base-color);
    border-radius: var(--rlm-border-radius-4);
  }
  transition: var(--transition);

  ${(props: AvatarStyleProps) =>
    props.clickable &&
    css`
      pointer-events: auto;
      cursor: pointer;
      -webkit-filter: brightness(100%);
      transition: var(--transition);
      &:hover {
        -webkit-filter: brightness(96%);
        transition: var(--transition);
      }
      &:active {
        -webkit-filter: brightness(92%);
        transition: var(--transition);
      }
    `}

  ${(props: AvatarStyleProps) =>
    props.raised &&
    css`
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    `}

      ${(props: AvatarStyleProps) =>
    props.borderRadiusOverride &&
    css`
      border-radius: ${props.borderRadiusOverride};
    `}
`;

const AvatarInner = styled(Box)<{ src: string }>`
  background-image: url(${(props) => props.src});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

type AvatarProps = {
  patp: string;
  avatar?: string | null;
  nickname?: string;
  size: number;
  simple?: boolean;
  sigilColor: [string, string];
  isLogin?: boolean;
  clickable?: boolean;
  opacity?: number;
  borderRadiusOverride?: string;
} & BoxProps;

export const Avatar: FC<AvatarProps> = (props: AvatarProps) => {
  const {
    patp,
    avatar,
    size,
    sigilColor = ['#000000', '#ffffff'],
    simple,
    clickable,
    isLogin,
    opacity,
    ...rest
  } = props;

  let innerContent = null;
  if (avatar) {
    innerContent = (
      <AvatarInner
        src={avatar}
        style={{
          borderRadius: rest.borderRadiusOverride,
          width: size,
          height: size,
        }}
      ></AvatarInner>
    );
  } else {
    if (!patp) return null;
    const sigilSize = size / 2;
    const innerPadding = sigilSize / 2;
    innerContent = (
      <motion.div
        style={{
          padding: innerPadding,
          backgroundColor: sigilColor[0],
          width: size,
          height: size,
        }}
      >
        {patp.split('-').length <= 2 &&
          sigil({
            patp,
            renderer: reactRenderer,
            size: sigilSize,
            icon: simple,
            margin: false,
            colors: sigilColor,
          })}
      </motion.div>
    );
  }

  return (
    <AvatarWrapper
      borderRadiusOverride={rest.borderRadiusOverride}
      clickable={clickable}
      sigilSize={size}
      width={size}
      height={size}
    >
      {innerContent}
    </AvatarWrapper>
  );
};
