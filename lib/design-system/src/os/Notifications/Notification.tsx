import { useMemo } from 'react';
import styled from 'styled-components';
import { timelineDate } from '../../util/date';
import { Flex, Text, Button, Icon, FlexProps } from '../../general';
import {
  NotificationButtonType,
  NotificationType,
} from './Notifications.types';

type NotificationProps = {
  appInfo?: {
    image: string;
    name: string;
    key: string;
  };
  isGrouped?: boolean;
  canHover?: boolean;
  containerWidth: number;
  notification: NotificationType;
  showApp?: boolean;
  showDismiss?: boolean;
  onLinkClick: (app: string, path: string, link?: string) => void;
  onDismiss: (app: string, path: string, id: number) => void;
};

export const Notification = ({
  isGrouped = false,
  showApp = true,
  canHover = false,
  appInfo,
  onDismiss,
  onLinkClick,
  notification,
  containerWidth,
}: NotificationProps) => {
  const { id, image, app, path, buttons } = notification;

  const displayDate = timelineDate(new Date(notification.createdAt));

  const textWidth = useMemo(
    () => (image ? containerWidth - 112 : containerWidth - 76),
    [containerWidth, image]
  );

  return (
    <NotifRow
      isGrouped={isGrouped}
      canHover={canHover}
      hasRead={notification.read}
      width={containerWidth}
      id={`notification-${id.toString()}`}
      background="card"
      onClick={(evt: React.MouseEvent<HTMLDivElement>) => {
        evt.stopPropagation();
        onLinkClick(app, path, notification.link);
      }}
    >
      <Flex
        position="relative"
        gap={8}
        flexDirection="row"
        width="100%"
        alignItems="center"
      >
        {image && <img className="notification-image" src={image} alt="" />}
        <Flex flexDirection="column" gap={2} width="100%">
          <Flex flexDirection="row" justifyContent="space-between">
            <Text.Custom
              width={textWidth - 40}
              truncate
              fontSize={2}
              fontWeight={500}
            >
              {notification.title}
            </Text.Custom>
            <Flex
              width={90}
              position="relative"
              flexDirection="row"
              justifyContent="flex-end"
            >
              <Text.Custom
                className="notification-date"
                width={90}
                textAlign="right"
                style={{ whiteSpace: 'nowrap', userSelect: 'none' }}
                fontSize={1}
                opacity={0.3}
              >
                {displayDate}
              </Text.Custom>
            </Flex>
          </Flex>
          <Text.Custom width={textWidth} truncate fontSize={1} opacity={0.5}>
            {notification.content}
          </Text.Custom>
        </Flex>

        <Button.IconButton
          className="notification-dismiss"
          size={22}
          onClick={(evt) => {
            evt.stopPropagation();
            onDismiss(app, path, id);
          }}
        >
          <Icon name="Close" size={20} opacity={0.4} />
        </Button.IconButton>
      </Flex>
      {/* {buttons && ()} */}
      {app && showApp && appInfo && (
        <NotifAppRow
          appInfo={appInfo}
          buttons={buttons}
          buttonsOnClick={
            buttons
              ? buttons.map((button: NotificationButtonType) => {
                  return () => {
                    console.log(`poke button ${button.label}`);
                  };
                })
              : []
          }
        />
      )}
    </NotifRow>
  );
};

export type NotifAppRowProps = {
  appInfo: {
    image: string;
    name: string;
    key: string;
  };
  buttons?: NotificationButtonType[];
  buttonsOnClick?: Array<() => void>;
};

export const NotifAppRow = ({
  appInfo,
  buttons,
  buttonsOnClick,
}: NotifAppRowProps) => {
  return (
    <AppRow>
      <Flex flexDirection="row" alignItems="center" gap={6}>
        <img className="notif-app-image" src={appInfo.image} alt="" />
        <Text.Custom
          style={{ whiteSpace: 'nowrap', userSelect: 'none' }}
          fontSize={1}
          fontWeight={500}
          opacity={0.8}
        >
          {appInfo.name}
        </Text.Custom>
      </Flex>
      {buttons && (
        <Flex flexDirection="row" gap={6}>
          {buttons
            .slice()
            .reverse()
            .map((button, index) => {
              // NOTE: there should only be two buttons max
              const ButtonTag =
                button.metadata &&
                JSON.parse(button.metadata).variant === 'secondary'
                  ? Button.Secondary
                  : Button.Minimal;

              return (
                <ButtonTag
                  key={`notif-button-${appInfo.key}-${index}`}
                  py={1}
                  px={2}
                  onClick={(evt) => {
                    const buttonClickFunc = buttonsOnClick
                      ? buttonsOnClick[index]
                      : () => {};
                    evt.stopPropagation();
                    buttonClickFunc();
                  }}
                >
                  {button.label}
                </ButtonTag>
              );
            })}
        </Flex>
      )}
    </AppRow>
  );
};

// Styles below

type NotifRowProps = {
  isGrouped: boolean;
  hasRead: boolean;
  canHover: boolean;
} & FlexProps;

const NotifRow = styled(Flex)<NotifRowProps>`
  display: inline-flex;
  gap: 8px;
  flex-direction: column;
  justify-content: space-between;
  padding: 6px;
  color: rgba(var(--rlm-text-rgba));
  border-radius: var(--rlm-border-radius-6);
  background: ${(props) =>
    props.isGrouped
      ? 'transparent'
      : props.hasRead
      ? 'rgba(var(--rlm-card-rgba), 0.7)'
      : 'rgba(var(--rlm-accent-rgba), 0.08)'};
  transition: var(--transition);
  &:hover {
    transition: var(--transition);
    background: ${(props) => props.canHover && 'rgba(0, 0, 0, 0.06)'};
    cursor: pointer;
    .notification-date {
      opacity: 0;
    }
    .notification-dismiss {
      opacity: 0.5;
    }
  }
  .notification-image {
    margin-left: 2px;
    width: 34px;
    height: 34px;
  }
  .notification-date {
    position: absolute;
    opacity: 0.3;
  }
  .notification-dismiss {
    position: absolute;
    opacity: 0;
    right: 4px;
  }
`;

const AppRow = styled(Flex)`
  display: inline-flex;
  gap: 6px;
  align-items: center;
  flex-direction: row;
  width: 100%;
  height: 27px;
  justify-content: space-between;
  margin-top: 4px;
  .notif-app-image {
    border-radius: 3px;
    width: 20px;
    height: 20px;
  }
`;
