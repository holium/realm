import { useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { SpaceModelType } from 'os/services/spaces/models/spaces';
import { useServices } from 'renderer/logic/store';
import { ShellActions } from 'renderer/logic/actions/shell';
import { pluralize } from 'renderer/logic/lib/text';
import { observer } from 'mobx-react';
import {
  ContextMenuOption,
  useContextMenu,
} from 'renderer/components/ContextMenu';
import { Row, Text, Flex, Icon } from '@holium/design-system';

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
  const { membership, ship } = useServices();
  const { getOptions, setOptions } = useContextMenu();
  const spaceRowId = useMemo(() => `space-row-${space.path}`, [space.path]);

  const roles = membership.spaces.get(space.path)!.get(ship!.patp)?.roles;
  const contextMenuOptions = useMemo(() => {
    const menu = [];
    menu.push({
      id: `space-row-${space.path}-btn-leave`,
      label: 'Copy link',
      onClick: (evt: React.MouseEvent<HTMLButtonElement>) => {
        evt.stopPropagation();
        navigator.clipboard.writeText(space.path.substring(1));
      },
    });
    if (roles?.includes('owner') || roles?.includes('admin')) {
      menu.push({
        id: `space-row-${space.path}-btn-edit`,
        label: 'Edit',
        onClick: () => {
          ShellActions.setBlur(true);
          ShellActions.openDialogWithStringProps('edit-space', {
            space: space.path,
          });
        },
      });
    }
    if (
      membership.spaces
        .get(space.path)!
        .get(ship!.patp)
        ?.roles.includes('owner')
    ) {
      menu.push({
        id: `space-row-${space.path}-btn-delete`,
        label: 'Delete',
        onClick: () => {
          ShellActions.setBlur(true);
          ShellActions.openDialogWithStringProps('delete-space-dialog', {
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
          ShellActions.setBlur(true);
          ShellActions.openDialogWithStringProps('leave-space-dialog', {
            path: space.path,
            name: space.name,
          });
        },
      });
    }

    return menu.filter(Boolean) as ContextMenuOption[];
  }, [membership.spaces, roles, ship, space.name, space.path]);

  useEffect(() => {
    if (contextMenuOptions !== getOptions(spaceRowId)) {
      setOptions(spaceRowId, contextMenuOptions);
    }
  }, [contextMenuOptions, getOptions, setOptions, spaceRowId]);

  const contextMenuButtonIds = contextMenuOptions.map((item) => item?.id);
  const memberCount = membership.getMemberCount(space.path);
  return (
    <Row
      id={spaceRowId}
      data-close-tray="true"
      selected={selected}
      className="realm-cursor-hover"
      onClick={(evt: any) => {
        // If a menu item is clicked
        if (!contextMenuButtonIds.includes(evt.target.id)) {
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
              <Icon name="Members" size={16} opacity={0.6} />
              <Text.Custom
                fontWeight={400}
                mt="1px"
                mr={1}
                opacity={0.6}
                fontSize={2}
              >
                {membership.getMemberCount(space.path)}{' '}
                {pluralize('member', memberCount)}
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
            {/* <Text fontWeight={500} mt="1px" opacity={0.6} variant="hint">
                {space.hasAdmin && `(owner)`}
              </Text> */}
          </Flex>
        </Flex>
      </Flex>
    </Row>
  );
};

export const SpaceRow = observer(SpaceRowPresenter);
