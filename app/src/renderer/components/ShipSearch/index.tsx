import { FC, useMemo } from 'react';
import { Avatar, Row, WindowedList } from '@holium/design-system';
import { motion } from 'framer-motion';
import { observer } from 'mobx-react';
import { ContactModelType } from 'os/services/ship/models/friends';
import { darken, lighten } from 'polished';
import { useServices } from 'renderer/logic/store';
import { ThemeType } from 'renderer/theme';
import styled from 'styled-components';

import { Box } from '../Box';
import { IconButton } from '../Button';
import { Flex } from '../Flex';
import { Icons } from '../Icons';
import { Text } from '../Text';

import { searchPatpOrNickname } from './helpers';

const resultHeight = 50;

interface ShipSearchProps {
  isDropdown?: boolean;
  search: string;
  selected: Set<string>;
  customBg?: string;
  onSelected: (ship: [string, string?], metadata?: any) => void;
}

interface IAutoCompleteBox {
  customBg: string;
  height?: any;
  theme: ThemeType;
}

const AutoCompleteBox = styled(motion.div)<IAutoCompleteBox>`
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
  box-shadow: ${(props: IAutoCompleteBox) => props.theme.elevations.two};
  border: 1px solid
    ${(props: IAutoCompleteBox) => props.theme.colors.ui.borderColor};

  background-color: ${(props: IAutoCompleteBox) => props.customBg};
`;

export const ShipSearch: FC<ShipSearchProps> = observer(
  ({ search, isDropdown, selected, onSelected }: ShipSearchProps) => {
    const { theme, ship, friends } = useServices();
    const { mode, dockColor, windowColor } = theme.currentTheme;

    const results = useMemo<Array<[string, ContactModelType]>>(() => {
      return searchPatpOrNickname(search, friends.search, selected, ship?.patp);
    }, [friends.all, search, selected, ship]);

    const isOpen = useMemo(
      () => search.length && results.length,
      [results.length, search.length]
    );

    const RowRenderer = (index: number, contact: (typeof results)[number]) => {
      const nickname = contact[1].nickname ?? '';
      const sigilColor = contact[1].color ?? '#000000';
      const avatar = contact[1].avatar;
      return (
        <Row
          key={`${contact[0]}-${nickname}-${index}`}
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
            <Text fontSize={2}>{contact[0]}</Text>
            {nickname ? (
              <Text fontSize={2} opacity={0.7}>
                {nickname.substring(0, 20)} {nickname.length > 21 && '...'}
              </Text>
            ) : (
              []
            )}
          </Flex>

          <Flex justifyContent="center" alignItems="center">
            {!isDropdown && (
              <IconButton
                luminosity={mode}
                customBg={dockColor}
                size={24}
                canFocus
                // isDisabled={selected.size > 0}
                onClick={(evt: any) => {
                  evt.stopPropagation();
                  onSelected([contact[0], nickname]);
                }}
              >
                <Icons opacity={0.5} name="Plus" />
              </IconButton>
            )}
          </Flex>
        </Row>
      );
    };
    const resultList = (
      <WindowedList
        style={{ marginRight: -12, width: 'calc(100% + 12px)' }}
        data={results}
        itemContent={RowRenderer}
      />
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
          customBg={
            mode === 'light'
              ? lighten(0.1, windowColor)
              : darken(0.2, windowColor)
          }
        >
          {resultList}
        </AutoCompleteBox>
      );
    } else {
      return resultList;
    }
  }
);
