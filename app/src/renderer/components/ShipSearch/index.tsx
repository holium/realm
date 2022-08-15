import { FC, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { toJS } from 'mobx';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import { searchPatpOrNickname } from './helpers';
import { Flex, Text, Box, Sigil, IconButton, Icons } from '../';
import { Row } from '../NewRow';
import { ContactModelType } from 'os/services/ship/models/contacts';
import { darken, lighten } from 'polished';
import { useServices } from 'renderer/logic/store';
import { ThemeType } from 'renderer/theme';

const resultHeight = 50;

interface ShipSearchProps {
  isDropdown?: boolean;
  heightOffset: number;
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
  box-shadow: ${(props: IAutoCompleteBox) => props.theme.elevations['two']};
  border: 1px solid
    ${(props: IAutoCompleteBox) => props.theme.colors.ui.borderColor};

  background-color: ${(props: IAutoCompleteBox) => props.customBg};
`;

export const ShipSearch: FC<ShipSearchProps> = observer(
  (props: ShipSearchProps) => {
    const { search, isDropdown, selected, customBg, heightOffset, onSelected } =
      props;
    const { desktop, ship } = useServices();
    const { mode, dockColor, windowColor } = desktop.theme;
    const contacts = ship ? Array.from(ship?.contacts.rolodex.entries()) : [];
    const isAddingDisabled = selected.size > 0;

    const results = useMemo<Array<[string, ContactModelType]>>(
      () => searchPatpOrNickname(search, contacts, selected, ship?.patp),
      [search, contacts, selected]
    );

    const isOpen = useMemo(
      () => search.length && results.length,
      [search.length > 0, results.length]
    );

    const RowRenderer = ({ index, style }: { index: number; style: any }) => {
      const contact = results[index];
      const nickname = contact[1].nickname!;
      const sigilColor = contact[1].color!;
      const avatar = contact[1].avatar!;
      return (
        <div style={style}>
          <Row
            key={contact[0]}
            style={{ justifyContent: 'space-between' }}
            customBg={customBg}
            onClick={(evt: any) => {
              evt.stopPropagation();
              isDropdown && onSelected([contact[0], nickname], contact[1]);
            }}
          >
            <Flex gap={10} flexDirection="row" alignItems="center">
              <Box>
                <Sigil
                  simple
                  size={22}
                  avatar={avatar}
                  patp={contact[0]}
                  color={[sigilColor || '#000000', 'white']}
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
                  isDisabled={isAddingDisabled}
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
        </div>
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
    let resultList = (
      <AutoSizer>
        {({ height, width }: { height: number; width: number }) => (
          <List
            className="List"
            height={height - heightOffset}
            itemCount={results.length}
            itemSize={40}
            width={width}
          >
            {RowRenderer}
          </List>
        )}
      </AutoSizer>
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
    //   return (
    //     <AutoSizer>
    //       {({ height, width }: { height: number; width: number }) => (
    //         <List
    //           className="List"
    //           height={height - heightOffset}
    //           itemCount={results.length}
    //           itemSize={40}
    //           width={width}
    //         >
    //           {RowRenderer}
    //         </List>
    //       )}
    //     </AutoSizer>
    //   );
  }
);

ShipSearch.defaultProps = {
  heightOffset: 0,
};
