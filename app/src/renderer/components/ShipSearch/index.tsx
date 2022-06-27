import { FC, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import { searchPatpOrNickname } from './helpers';
import { Flex, Text, Box, Sigil, IconButton, Icons } from '../';
import { Row } from '../NewRow';
import { ContactModelType } from 'core-a/ship/stores/contacts';
import { darken } from 'polished';
import { useServices } from 'renderer/logic/store-2';

interface ShipSearchProps {
  heightOffset: number;
  search: string;
  selected: Set<string>;
  customBg?: string;
  onSelected: (ship: [string, string?]) => void;
}

export const ShipSearch: FC<ShipSearchProps> = observer(
  (props: ShipSearchProps) => {
    const { search, selected, customBg, heightOffset, onSelected } = props;
    const { shell, ship } = useServices();
    const { theme } = shell;
    const { textTheme } = theme.theme;
    const contacts = ship ? Array.from(ship?.contacts.rolodex.entries()) : [];
    const isAddingDisabled = selected.size > 0;

    const results = useMemo<Array<[string, ContactModelType]>>(
      () => searchPatpOrNickname(search, contacts, selected),
      [search, contacts, selected]
    );

    const RowRenderer = ({ index, style }: { index: number; style: any }) => {
      const contact = results[index];
      const nickname = contact[1].nickname!;
      const sigilColor = contact[1].color!;
      const avatar = contact[1].avatar!;
      return (
        <div
          style={{
            ...style,
            marginLeft: 8,
            marginRight: 8,
            width: 'calc(100% - 16px)',
          }}
        >
          <Row
            key={contact[0]}
            style={{ justifyContent: 'space-between' }}
            customBg={customBg ? darken(0.1, customBg) : undefined}
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
              <IconButton
                luminosity={textTheme}
                customBg={customBg ? darken(0.15, customBg) : undefined}
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
            </Flex>
          </Row>
        </div>
      );
    };

    return (
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
  }
);

ShipSearch.defaultProps = {
  heightOffset: 0,
};
