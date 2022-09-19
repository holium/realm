import { FC, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { rgba, darken, lighten } from 'polished';
import styled, { css } from 'styled-components';
import { ContextMenu, Flex, Icons, Text } from 'renderer/components';
import { SpaceModelType } from 'os/services/spaces/models/spaces';
import { ThemeType } from '../../theme';
import { useServices } from 'renderer/logic/store';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { pluralize } from 'renderer/logic/lib/text';

export const EmptyGroup = styled.div`
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
  height: 52px;
  position: relative;
  border-radius: 8px;
  padding: 0 8px;
  display: flex;
  flex-direction: row;
  overflow: visible;
  align-items: center;
  transition: ${(props: RowProps) => props.theme.transition};
  ${(props: RowProps) =>
    props.selected
      ? css`
          background-color: ${darken(0.03, props.customBg)};
        `
      : css`
          &:hover {
            transition: ${(props: RowProps) => props.theme.transition};
            background-color: ${props.customBg
              ? darken(0.025, props.customBg)
              : 'inherit'};
          }
        `}
`;

type SpaceRowProps = {
  selected: boolean;
  space: SpaceModelType;
  onSelect: (spaceKey: string) => void;
};

export const SpaceRow: FC<SpaceRowProps> = (props: SpaceRowProps) => {
  const { selected, space, onSelect } = props;
  const { theme, membership } = useServices();
  const [deleteLoading, setDeleteLoading] = useState(false);
  // const {} =
  const rowRef = useRef<any>(null);

  const currentTheme = useMemo(() => theme.currentTheme, [theme.currentTheme]);

  const contextMenuItems = [
    {
      id: `space-row-${space.path}-btn-edit`,
      label: 'Edit',
      onClick: (evt: any) => {
        // evt.stopPropagation();
        // DesktopActions.toggleDevTools();
      },
    },
    {
      id: `space-row-${space.path}-btn-delete`,
      label: 'Delete',
      loading: deleteLoading,
      onClick: (evt: any) => {
        setDeleteLoading(true);
        SpacesActions.deleteSpace(space.path).then((_response: any) => {
          setDeleteLoading(false);
        });
        // DesktopActions.toggleDevTools();
      },
    },
  ];

  const contextMenuButtonIds = contextMenuItems.map((item: any) => item.id);
  const memberCount = membership.getMemberCount(space.path);
  return (
    <SpaceRowStyle
      id={`space-row-${space.path}`}
      ref={rowRef}
      data-close-tray="true"
      selected={selected}
      className="realm-cursor-hover"
      customBg={currentTheme.windowColor}
      onClick={(evt: any) => {
        // If a menu item is clicked
        if (contextMenuButtonIds.includes(evt.target.id)) {
          return;
        } else {
          onSelect(space.path);
        }
      }}
      // onContextMenu={(evt: any) => evt.stopPropagation()}
    >
      <ContextMenu
        isComponentContext
        textColor={currentTheme.textColor}
        customBg={rgba(currentTheme.windowColor, 0.9)}
        containerId={`space-row-${space.path}`}
        parentRef={rowRef}
        style={{ minWidth: 180 }}
        position="below"
        menu={contextMenuItems}
      />
      <Flex style={{ pointerEvents: 'none' }} alignItems="center">
        {space.picture ? (
          <img
            style={{ borderRadius: 6 }}
            height="32px"
            width="32px"
            src={space.picture}
          />
        ) : (
          <EmptyGroup color={space.color! || '#000000'} />
        )}
        <Flex ml="10px" flexDirection="column">
          <Text
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
            fontSize={3}
            color={currentTheme.textColor}
            fontWeight={500}
            variant="body"
          >
            {space.name}

            {/* TODO add notification */}
            {/* <Icons.ExpandMore ml="6px" /> */}
          </Text>
          <Flex flexDirection="row" gap={12}>
            <Flex gap={4} flexDirection="row" alignItems="center">
              <Icons name="Members" size={16} opacity={0.6} />

              <Text fontWeight={400} mt="1px" mr={1} opacity={0.6} fontSize={2}>
                {membership.getMemberCount(space.path)}{' '}
                {pluralize('member', memberCount)}
              </Text>
            </Flex>
            {space.path === '~hatryx-lastud/spaces/other-life' && (
              <Flex gap={4} flexDirection="row" alignItems="center">
                <Icons name="Coins" size={16} opacity={0.6} />
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
