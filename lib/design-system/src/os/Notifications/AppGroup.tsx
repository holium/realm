import { Flex, BoxProps, FlexProps, getVar, Text, Button, Icon } from '../../';
import styled from 'styled-components';
import { rgba } from 'polished';
import { NotificationType } from './Notifications.types';
import { NotifAppRow, Notification } from './Notification';

type AppGroupProps = {
  appInfo: {
    image: string;
    name: string;
  };
  groupByPath?: boolean;
  containerWidth: number;
  notifications: NotificationType[];
} & BoxProps;

export const AppGroup = ({
  groupByPath = false,
  notifications,
  containerWidth,
  appInfo,
}: AppGroupProps) => {
  let paths = notifications.map((n) => n.path);
  // reduce notifications to unique paths
  paths = paths.filter((path, index) => paths.indexOf(path) === index);
  let groupedNotifications = paths.map((path) => {
    let grouped = notifications.filter((n) => n.path === path);
    return grouped;
  });
  if (appInfo.name === 'Realm Chat') {
    // todo render chat notifications
  }

  return (
    <AppGroupContainer width={containerWidth}>
      {!groupByPath
        ? notifications.map((n) => {
            return (
              <Notification
                isGrouped
                canHover
                showApp={false}
                containerWidth={containerWidth - 12}
                notification={n}
                onDismiss={() => {
                  // n.dismiss();
                  console.log('dismissed', n.id);
                }}
              />
            );
          })
        : groupedNotifications.map((notifs) => {
            if (!notifs[0].metadata) return <div />;
            const metadata = JSON.parse(notifs[0].metadata);
            return (
              <PathContainer>
                <Flex justifyContent="space-between" alignItems="center" py={1}>
                  <Flex px={1} flexDirection="row" gap={6}>
                    {metadata.image && (
                      <img
                        height={20}
                        width={20}
                        style={{ borderRadius: 3 }}
                        src={metadata.image}
                        alt=""
                      />
                    )}
                    <Text.Custom fontSize={2} fontWeight={500} opacity={0.8}>
                      {metadata.title}
                    </Text.Custom>
                  </Flex>
                  <Button.IconButton size={24} mr={1}>
                    <Icon name="ArrowDown" size={20} opacity={0.3} />
                  </Button.IconButton>
                </Flex>
                <Flex opacity={0.7} flexDirection="column" gap={2}>
                  {notifs.map((n) => {
                    return (
                      <Notification
                        isGrouped
                        canHover
                        showApp={false}
                        containerWidth={containerWidth - 20}
                        notification={n}
                        onDismiss={() => {
                          // n.dismiss();
                          console.log('dismissed', n.id);
                        }}
                      />
                    );
                  })}
                </Flex>
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
            notifications.forEach((n) => {
              console.log('dismissed', n.id);
            });
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
  color: var(--rlm-text-color);
  border-radius: var(--rlm-border-radius-6);
  background: ${() => rgba(getVar('card'), 0.7)};
  transition: var(--transition);
`;

const PathContainer = styled(Flex)`
  display: inline-flex;
  gap: 0px;
  flex-direction: column;
  justify-content: space-between;
  padding: 4px 4px 4px 4px;
  color: var(--rlm-text-color);
  border-radius: var(--rlm-border-radius-6);
  &:hover {
    transition: var(--transition);
    background: rgba(0, 0, 0, 0.04);
  }
  transition: var(--transition);
`;
