import { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Flex, Icon, Row, Text } from '@holium/design-system/general';

import {
  ContextMenuOption,
  useContextMenu,
} from 'renderer/components/ContextMenu';
import { pluralize } from 'renderer/lib/text';
import { useAppState } from 'renderer/stores/app.store';
import { SpaceModelType } from 'renderer/stores/models/spaces.model';
import { useShipStore } from 'renderer/stores/ship.store';

export const EmptyGroup = styled.div<{ color?: string }>`
  height: 32px;
  width: 32px;
  background: ${(p) => p.color || '#000'};
  border-radius: 4px;
`;

interface SpaceRowProps {
  selected: boolean;
  space: SpaceModelType;
  onSelect: (spaceKey: string) => void;
}

const SpaceRowPresenter = (props: SpaceRowProps) => {
  const { selected, space, onSelect } = props;
  const { loggedInAccount, shellStore, theme } = useAppState();
  const { spacesStore } = useShipStore();
  const { getOptions, setOptions } = useContextMenu();
  const spaceRowId = useMemo(() => `space-row-${space.path}`, [space.path]);

  const members = spacesStore.spaces.get(space.path)?.members;
  const member = members?.all.get(loggedInAccount?.serverId ?? '');
  const roles = member?.roles;
  const contextMenuOptions = useMemo(() => {
    const menu = [];
    menu.push({
      id: `space-row-${space.path}-btn-leave`,
      label: 'Copy link',
      onClick: (evt: React.MouseEvent<HTMLDivElement>) => {
        evt.stopPropagation();
        navigator.clipboard.writeText('/spaces' + space.path);
      },
    });
    if (loggedInAccount && space.isAdmin(loggedInAccount.serverId)) {
      menu.push({
        id: `space-row-${space.path}-btn-edit`,
        label: 'Edit',
        onClick: () => {
          shellStore.setIsBlurred(true);
          shellStore.openDialogWithStringProps('edit-space', {
            space: space.path,
          });
        },
      });
    }

    if (space.isHost()) {
      menu.push({
        id: `space-row-${space.path}-btn-delete`,
        label: 'Delete',
        onClick: () => {
          shellStore.setIsBlurred(true);
          shellStore.openDialogWithStringProps('delete-space-dialog', {
            path: space.path,
            name: space.name,
          });
        },
      });
    } else {
      menu.push({
        id: `space-row-${space.path}-btn-leave`,
        label: 'Leave',
        onClick: () => {
          shellStore.setIsBlurred(true);
          shellStore.openDialogWithStringProps('leave-space-dialog', {
            path: space.path,
            name: space.name,
          });
        },
      });
    }

    return menu.filter(Boolean) as ContextMenuOption[];
  }, [
    spacesStore.spaces,
    roles,
    loggedInAccount,
    space.name,
    space.path,
    theme,
  ]);

  useEffect(() => {
    if (contextMenuOptions !== getOptions(spaceRowId)) {
      setOptions(spaceRowId, contextMenuOptions);
    }
  }, [contextMenuOptions, getOptions, setOptions, spaceRowId]);

  const contextMenuButtonIds = contextMenuOptions.map((item) => item?.id);
  let memberCount = 0;
  members?.all.forEach((m) =>
    m.status !== 'invited' ? (memberCount += 1) : null
  );
  return (
    <Row
      id={spaceRowId}
      data-close-tray="true"
      selected={selected}
      className="realm-cursor-hover"
      onClick={(evt: any) => {
        // If a menu item is clicked
        if (!contextMenuButtonIds.includes(evt.target.id)) {
          console.log('clicking on spacerow', space.path);
          onSelect(space.path);
        }
      }}
    >
      <Flex style={{ pointerEvents: 'none' }} alignItems="center">
        {space.picture ? (
          <img
            style={{ borderRadius: 6 }}
            height="32px"
            width="32px"
            src={space.picture}
            alt={space.path}
          />
        ) : (
          <EmptyGroup color={space.color || '#000000'} />
        )}
        <Flex ml="10px" flexDirection="column">
          <Text.Custom
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
            fontSize={3}
            fontWeight={500}
          >
            {space.name}
          </Text.Custom>
          <Flex flexDirection="row" gap={12}>
            <Flex gap={4} flexDirection="row" alignItems="center">
              <Icon name="Members" size={16} opacity={0.7} />
              <Text.Custom
                fontWeight={400}
                mt="1px"
                mr={1}
                opacity={0.6}
                fontSize={2}
              >
                {memberCount} {pluralize('member', memberCount || 0)}
              </Text.Custom>
            </Flex>
            {/* {space.path === '~hatryx-lastud/spaces/other-life' && (
              <Flex gap={4} flexDirection="row" alignItems="center">
                <Icon name="Coins" size={16} opacity={0.6} />
                <Text
                  fontWeight={400}
                  color={currentTheme.textColor}
                  mt="1px"
                  mr={1}
                  opacity={0.6}
                  fontSize={2}
                >
                  $LIFE
                </Text>
              </Flex>
            )} */}
            {/* <Text.Custom fontWeight={500} mt="1px" opacity={0.6} variant="hint">
                {space.hasAdmin && `(owner)`}
              </Text.Custom> */}
          </Flex>
        </Flex>
      </Flex>
    </Row>
  );
};

export const SpaceRow = observer(SpaceRowPresenter);
