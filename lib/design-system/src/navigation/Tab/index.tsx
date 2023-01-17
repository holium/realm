import { Layout } from '../../components/Layout';
import React, { FC } from 'react';
import styled, { css } from 'styled-components';
import { Text, Favicon, Row, BoxProps, Icon, Button } from '../../';
import { AvatarRow, ContactData } from '../../general/Avatar/AvatarRow';

const widths = {
  collapsed: 40,
  expanded: 270,
};

const TabRow = styled(Row)<{ collapsed?: boolean }>`
  flex-direction: column;
  flex: 1;
  padding: 4px 4px 4px 6px;
  align-items: flex-start;
  text-align: left;
  background-color: var(--rlm-overlay-hover);
  &:hover {
    background-color: var(--rlm-overlay-active);
  }
  ${(props) =>
    props.collapsed &&
    css`
      min-height: 30px;
      width: 30px;
      padding: 6px 0px;
      align-items: center;
      justify-content: center;
      text-align: left;
    `}
`;

export type TabProps = {
  favicon: string;
  url: string;
  title: string;
  collapsed?: boolean;
  multiplayer?: {
    host: string;
    peers: ContactData[];
  };
  onNavigate: (url: string) => void;
  onClose: (url: string) => void;
} & BoxProps;

export const Tab: FC<TabProps> = (props: TabProps) => {
  const {
    id,
    favicon,
    collapsed,
    url,
    title,
    onNavigate,
    onClose,
    multiplayer,
  } = props;

  if (collapsed) {
    return (
      <TabRow id={id} collapsed onClick={() => onNavigate(url)}>
        <Favicon src={favicon} />
        {multiplayer && (
          <AvatarRow
            borderRadiusOverride="2px"
            offset={3}
            size={18}
            direction="vertical"
            people={multiplayer.peers}
          />
        )}
      </TabRow>
    );
  }

  let multiplayerRow = null;
  if (multiplayer) {
    multiplayerRow = (
      <Layout.Row mb="2px" gap={2} flex={1} justifyContent="space-between">
        <AvatarRow
          size={18}
          offset={3}
          borderRadiusOverride="2px"
          people={multiplayer.peers}
        />
        <Text.Custom opacity={0.5} fontSize={1} fontWeight={300}>
          {multiplayer.host}
        </Text.Custom>
      </Layout.Row>
    );
  }
  return (
    <TabRow id={id} width={collapsed ? widths.collapsed : widths.expanded}>
      <Layout.Row flex={1} justifyContent="space-between">
        <Layout.Row gap={6}>
          <Favicon src={favicon} />
          {!collapsed && (
            <Text.Custom truncate width={widths.expanded - 28}>
              {title}
            </Text.Custom>
          )}
        </Layout.Row>
        <Button.IconButton
          size={20}
          onClick={(evt: React.MouseEvent<HTMLButtonElement>) => {
            evt.stopPropagation();
            onClose(props.url);
          }}
        >
          <Icon name="Close" size={16} opacity={0.6} />
        </Button.IconButton>
      </Layout.Row>
      {multiplayerRow}
    </TabRow>
  );
};
