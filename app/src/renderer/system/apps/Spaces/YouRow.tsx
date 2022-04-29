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
import { ShipModelType } from '~realm/ship/store';

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

type SpaceRowProps = { ship: ShipModelType };

export const YouRow: FC<SpaceRowProps> = (props: SpaceRowProps) => {
  const { ship } = props;
  return (
    <SpaceRowStyle>
      <Flex alignItems="center">
        <Sigil
          simple
          borderRadiusOverride="6px"
          size={32}
          avatar={ship.avatar}
          patp={ship.patp}
          color={[ship.color || '#000000', 'white']}
        />
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
            {ship.nickname || ship.patp}
          </Text>
        </Flex>
      </Flex>
    </SpaceRowStyle>
  );
};
