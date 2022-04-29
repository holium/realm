import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { rgba, lighten, darken } from 'polished';

import { WindowThemeType } from '../../../logic/stores/config';
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
import styled from 'styled-components';
import { Space } from './SpacesList';

const EmptyGroup = styled.div`
  height: 32px;
  width: 32px;
  background: ${(p) => p.color || '#000'};
  border-radius: 4px;
`;

const SpaceRowStyle = styled.div`
  height: 48px;
  border-radius: 6px;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  /* &:hover {

  } */
`;

type SpaceRowProps = { space: Space };

export const SpaceRow: FC<SpaceRowProps> = (props: SpaceRowProps) => {
  const { space } = props;
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <SpaceRowStyle>
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
