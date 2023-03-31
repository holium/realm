import {
  Flex,
  BoxProps,
  FlexProps,
  Text,
  Button,
  Icon,
  Avatar,
  NoScrollBar,
} from '../../';
import styled from 'styled-components';
import { NotificationType } from './Notifications.types';
import { NotifAppRow, Notification } from './Notification';
import { useState } from 'react';

type AppGroupProps = {
  appInfo: {
    image: string;
    name: string;
    key: string;
  };
  groupByPath?: boolean;
  containerWidth: number;
  notifications: NotificationType[];

  onPathLookup: (
    app: string,
    path: string
  ) => {
    title: string;
    sigil?: any;
    image?: string;
  } | null;
  onLinkClick: (app: string, path: string, link?: string) => void;
  onDismiss: (app: string, path: string, id: number) => void;
  onDismissAll: (app: string, path?: string) => void;
} & BoxProps;

export const AppGroup = ({
  groupByPath = false,
  notifications,
  containerWidth,
  appInfo,
  onPathLookup,
  onDismiss,
  onDismissAll,
  onLinkClick,
}: AppGroupProps) => {
  let paths = notifications.map((n) => n.path);
  // reduce notifications to unique paths
  paths = paths.filter((path, index) => paths.indexOf(path) === index);
  let groupedNotifications = paths.map((path) => {
    let grouped = notifications.filter((n) => n.path === path);
    return grouped;
  });

  const [pathExpandMap, setPathExpandMap] = useState<{
    [path: string]: boolean;
  }>(paths.reduce((acc, path) => ({ ...acc, [path]: false }), {}));

  const outerOffset = 12;
  const innerOffset = 20;

  const renderedNotifications = (
    notifs: NotificationType[],
    paddingOffset: number
  ) => {
    return notifs.map((n) => {
      return (
        <Notification
          key={`${n.path}-${n.id}`}
          isGrouped
          canHover
          showApp={false}
          containerWidth={containerWidth - paddingOffset}
          notification={n}
          onDismiss={onDismiss}
          onLinkClick={onLinkClick}
        />
      );
    });
  };

  return (
    <AppGroupContainer width={containerWidth}>
      {!groupByPath
        ? renderedNotifications(notifications, outerOffset)
        : groupedNotifications.map((notifs) => {
            const metadata = onPathLookup(notifs[0].app, notifs[0].path);
            if (!metadata) return renderedNotifications(notifs, outerOffset);
            let title = metadata.title;

            let avatar;
            if (metadata?.image) {
              avatar = (
                <img
                  height={20}
                  width={20}
                  style={{ borderRadius: 3 }}
                  src={metadata.image}
                  alt=""
                />
              );
            } else if (metadata.sigil) {
              avatar = (
                <Avatar
                  simple
                  patp={metadata.sigil.patp}
                  avatar={metadata.image}
                  size={20}
                  sigilColor={metadata.sigil.color}
                />
              );
            }

            const isExpanded = pathExpandMap[notifs[0].path];
            return (
              <PathContainer
                key={`path-grouped-${notifs[0].app}-${notifs[0].path}`}
                width={containerWidth - 12}
              >
                <Flex
                  position="sticky"
                  justifyContent="space-between"
                  alignItems="center"
                  py={1}
                >
                  <Flex px={1} flexDirection="row" alignItems="center" gap={6}>
                    {avatar}
                    <Text.Custom fontSize={2} fontWeight={500} opacity={0.8}>
                      {title}
                    </Text.Custom>
                  </Flex>
                  <Flex flexDirection="row" alignItems="center">
                    {notifs.length > 1 && (
                      <Button.IconButton
                        size={24}
                        mr={1}
                        onClick={(evt) => {
                          evt.stopPropagation();
                          setPathExpandMap({
                            ...pathExpandMap,
                            [notifs[0].path]: !isExpanded,
                          });
                        }}
                      >
                        <Icon
                          name={isExpanded ? 'ArrowUp' : 'ArrowDown'}
                          size={20}
                          opacity={0.3}
                        />
                      </Button.IconButton>
                    )}
                    <Button.IconButton
                      size={24}
                      mr={1}
                      onClick={(evt) => {
                        evt.stopPropagation();
                        onDismissAll(notifs[0].app, notifs[0].path);
                      }}
                    >
                      <Icon name="Close" size={20} opacity={0.3} />
                    </Button.IconButton>
                  </Flex>
                </Flex>
                <NoScrollBar
                  opacity={0.7}
                  flexDirection="column"
                  gap={2}
                  maxHeight={isExpanded ? '250px' : undefined}
                  width={containerWidth - innerOffset}
                  height={isExpanded ? '100%' : 46}
                  overflowY={isExpanded ? 'auto' : 'hidden'}
                >
                  {isExpanded ? (
                    renderedNotifications(notifs, innerOffset)
                  ) : (
                    <Notification
                      isGrouped
                      canHover
                      showApp={false}
                      containerWidth={containerWidth - innerOffset}
                      notification={notifs[0]}
                      onDismiss={onDismiss}
                      onLinkClick={onLinkClick}
                    />
                  )}
                </NoScrollBar>
              </PathContainer>
            );
          })}

      <NotifAppRow
        appInfo={appInfo}
        buttons={[
          {
            label: 'Dismiss All',
            path: '',
            data: '',
            metadata: JSON.stringify({ variant: 'secondary' }),
          },
        ]}
        buttonsOnClick={[
          () => {
            appInfo && onDismissAll(appInfo.key);
          },
        ]}
      />
    </AppGroupContainer>
  );
};

type AppGroupContainerProps = {
  hasImage?: boolean;
} & FlexProps;

const AppGroupContainer = styled(Flex)<AppGroupContainerProps>`
  display: inline-flex;
  gap: 8px;
  flex-direction: column;
  justify-content: space-between;
  padding: 6px;
  color: rgba(var(--rlm-text-rgba));
  border-radius: var(--rlm-border-radius-6);
  background: rgba(var(--rlm-card-rgba), 0.7);
  transition: var(--transition);
`;

const PathContainer = styled(Flex)`
  display: inline-flex;
  gap: 0px;
  position: relative;
  flex-direction: column;
  justify-content: space-between;
  padding: 4px 4px 4px 4px;
  color: rgba(var(--rlm-text-rgba));
  border-radius: var(--rlm-border-radius-6);
  &:hover {
    transition: var(--transition);
    background: rgba(0, 0, 0, 0.04);
  }
  transition: var(--transition);
`;
