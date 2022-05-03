import { FC, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { observer } from 'mobx-react';
import { rgba, lighten, darken } from 'polished';
import { useMst, useShip } from '../../../logic/store';

import {
  Grid,
  Flex,
  Box,
  Input,
  IconButton,
  Icons,
  Sigil,
  MenuItem,
  TextButton,
  Text,
} from '../../../components';
import { ThemeType } from '../../../theme';
import styled, { css } from 'styled-components';
import { Space } from './SpacesList';

const EmptyGroup = styled.div`
  height: 32px;
  width: 32px;
  background: ${(p) => p.color || '#000'};
  border-radius: 4px;
`;

type RowProps = {
  theme: ThemeType;
  selected?: boolean;
  customBg: string;
};

export const SpaceRowStyle = styled(motion.div)<RowProps>`
  height: 48px;
  border-radius: 8px;
  padding: 0 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  transition: ${(props: RowProps) => props.theme.transition};
  ${(props: RowProps) =>
    props.selected
      ? css`
          color: ${props.theme.colors.brand.primary};
          background-color: ${rgba(props.customBg, 0.3)};
        `
      : css`
          &:hover {
            transition: ${(props: RowProps) => props.theme.transition};
            background-color: ${props.customBg
              ? rgba(lighten(0.1, props.customBg), 0.4)
              : 'inherit'};
          }
        `}
`;

type SpaceRowProps = { space: Space };

export const SpaceRow: FC<SpaceRowProps> = (props: SpaceRowProps) => {
  const { space } = props;
  const { ship } = useShip();
  const theme = useMemo(() => ship!.theme, [ship!.theme]);
  return (
    <SpaceRowStyle customBg={theme.backgroundColor}>
      <Flex
        alignItems="center"
        // style={{ flex: 1, opacity: space.status !== 'active' ? 0.3 : 1 }}
      >
        {space.picture ? (
          <img
            style={{ borderRadius: 6 }}
            height="32px"
            width="32px"
            src={space.picture}
          />
        ) : (
          <EmptyGroup color={space.color} />
        )}
        <Flex ml={2} flexDirection="column">
          <Text
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
            fontSize={3}
            fontWeight={500}
            variant="body"
          >
            {space.title}

            {/* TODO add notification */}
            {/* <Icons.ExpandMore ml="6px" /> */}
          </Text>
          <Flex flexDirection="row" gap={12}>
            <Flex gap={4} flexDirection="row" alignItems="center">
              <Icons name="Members" size={16} opacity={0.6} />
              <Text fontWeight={400} mt="1px" mr={1} opacity={0.6} fontSize={2}>
                {space.memberCount} members
              </Text>
            </Flex>
            {space.token && (
              <Flex gap={4} flexDirection="row" alignItems="center">
                <Icons name="Coins" size={16} opacity={0.6} />
                <Text
                  fontWeight={400}
                  mt="1px"
                  mr={1}
                  opacity={0.6}
                  fontSize={2}
                >
                  {space.token}
                </Text>
              </Flex>
            )}
            {/* <Text fontWeight={500} mt="1px" opacity={0.6} variant="hint">
                {space.hasAdmin && `(owner)`}
              </Text> */}
          </Flex>
        </Flex>
      </Flex>
    </SpaceRowStyle>
  );
};
