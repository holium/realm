import { FC } from 'react';
import { darken } from 'polished';

import {
  Grid,
  Flex,
  Box,
  Input,
  IconButton,
  Icons,
  Sigil,
  Text,
} from '../../../components';
import { PathsType } from '../../../components/Icons/icons';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { ThemeType } from '../../../theme';

type CircleButtonProps = {
  icon: PathsType;
  title?: string;
};

type StyleProps = {
  theme: ThemeType;
};

const CircleBtn = styled(motion.div)`
  border-radius: 50%;
  height: 32px;
  width: 32px;
  cursor: pointer;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  ${(props: StyleProps) =>
    css`
      background-color: ${props.theme.colors.brand.primary};
      transition: ${props.theme.transition};
      /* &:hover {
        transition: ${props.theme.transition};
        background-color: ${darken(0.05, props.theme.colors.brand.primary)};
      } */
      svg: {
        path: {
          fill: white;
        }
      }
    `}
`;

const FullButton = styled(Flex)`
  ${(props: StyleProps) =>
    css`
      cursor: pointer;

      &:hover {
        transition: ${props.theme.transition};
        ${CircleBtn} {
          transition: ${props.theme.transition};
          background-color: ${darken(0.05, props.theme.colors.brand.primary)};
        }
        ${Text} {
          transition: ${props.theme.transition};
          color: ${darken(0.05, props.theme.colors.text.primary)};
        }
      }
    `}
`;

export const CircleButton: FC<CircleButtonProps> = (
  props: CircleButtonProps
) => {
  const { icon, title } = props;
  // const { walletStore } = useMst();

  return (
    <FullButton
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <CircleBtn>
        <Icons name={icon} size={24} color="inherit" />
      </CircleBtn>
      {title && (
        <Text mt={2} fontWeight={300} color="text.primary" fontSize={3}>
          {title}
        </Text>
      )}
    </FullButton>
  );
};
