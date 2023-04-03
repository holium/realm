import { FC, useMemo } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { searchPatpOrNickname } from './helpers';
import { ContactModelType } from 'os/services/ship/models/friends';
import { darken, lighten } from 'polished';
import { useServices } from 'renderer/logic/store';
import { ThemeType } from 'renderer/theme';
import {
  Flex,
  Box,
  Button,
  Icon,
  Row,
  Avatar,
  WindowedList,
  Text,
  Card,
} from '@holium/design-system';
import { useShipStore } from 'renderer/stores/ship.store';

const resultHeight = 50;

interface ShipSearchProps {
  isDropdown?: boolean;
  search: string;
  selected: Set<string>;
  customBg?: string;
  onSelected: (ship: [string, string?], metadata?: any) => void;
}

const AutoCompleteBox = styled(Card)`
  position: absolute;
  display: flex;
  top: 38px;
  left: 0;
  right: 0;
  /* height: calc(fit-content + 8px); */
  z-index: 10;
  /* min-height: 40px; */
  /* margin-top: 2px; */
  padding: 4px 4px;
  border-radius: 9px;
`;

export const ShipSearch: FC<ShipSearchProps> = observer(
  ({ search, isDropdown, selected, onSelected }: ShipSearchProps) => {
    const { ship, friends } = useShipStore();

    const results = useMemo<Array<[string, ContactModelType]>>(() => {
      return searchPatpOrNickname(search, friends.search, selected, ship?.patp);
    }, [friends.all, search, selected, ship]);

    const isOpen = useMemo(
      () => search.length && results.length,
      [results.length, search.length]
    );

    const RowRenderer = (contact: typeof results[number]) => {
      const nickname = contact[1].nickname ?? '';
      const sigilColor = contact[1].color ?? '#000000';
      const avatar = contact[1].avatar;
      return (
        <Row
          key={contact[0]}
          style={{ justifyContent: 'space-between' }}
          onClick={(evt: any) => {
            evt.stopPropagation();
            isDropdown && onSelected([contact[0], nickname], contact[1]);
          }}
        >
          <Flex gap={10} flexDirection="row" alignItems="center">
            <Box>
              <Avatar
                simple
                size={22}
                avatar={avatar}
                patp={contact[0]}
                sigilColor={[sigilColor || '#000000', 'white']}
              />
            </Box>
            <Text.Custom fontSize={2}>{contact[0]}</Text.Custom>
            {nickname ? (
              <Text.Custom fontSize={2} opacity={0.7}>
                {nickname.substring(0, 20)} {nickname.length > 21 && '...'}
              </Text.Custom>
            ) : (
              []
            )}
          </Flex>

          <Flex justifyContent="center" alignItems="center">
            {!isDropdown && (
              <Button.IconButton
                // isDisabled={selected.size > 0}
                onClick={(evt: any) => {
                  evt.stopPropagation();
                  onSelected([contact[0], nickname]);
                }}
              >
                <Icon opacity={0.5} name="Plus" size={20} />
              </Button.IconButton>
            )}
          </Flex>
        </Row>
      );
    };
    // Todo, move the show logic in here
    if (results.length === 0) {
      return (
        <Flex
          flex={1}
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap={24}
        >
          {/* <Text
                    color={textColor}
                    width={200}
                    textAlign="center"
                    opacity={0.6}
                  >
                    No DMs
                  </Text> */}
          {/* <Text
            color={textColor}
            width={200}
            fontSize={2}
            textAlign="center"
            opacity={0.3}
          >
            Type a valid ID
          </Text> */}
        </Flex>
      );
    }
    const resultList = (
      <WindowedList data={results} rowRenderer={RowRenderer} />
    );

    if (isDropdown) {
      return (
        <AutoCompleteBox
          // position="absolute"
          initial={{
            opacity: 0,
            y: 8,
            height: 0,
          }}
          animate={{
            opacity: isOpen ? 1 : 0,
            visibility: isOpen ? 'visible' : 'hidden',
            y: 0,
            height: results.length < 10 ? results.length * resultHeight : 400,
            transition: {
              duration: 0.2,
            },
          }}
          exit={{
            opacity: 0,
            y: 8,
            height: resultHeight / 2,
            transition: {
              duration: 0.2,
            },
          }}
        >
          {resultList}
        </AutoCompleteBox>
      );
    } else {
      return resultList;
    }
  }
);
