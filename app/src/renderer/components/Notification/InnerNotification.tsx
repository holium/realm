import { FC, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { rgba, lighten, darken } from 'polished';

import { Flex, Text, TextButton, IconButton, Icons } from 'renderer/components';
import { Row } from '../NewRow';

interface InnerNotificationProps {
  id: string;
  title: string;
  seedColor: string;
  subtitle?: string;
  actionText?: string;
  onAction?: (notifId: string) => void;
  onDismiss: (notifId: string) => void;
}

export const InnerNotification: FC<InnerNotificationProps> = ({
  id,
  title,
  seedColor,
  subtitle,
  actionText,
  onAction,
  onDismiss,
}: InnerNotificationProps) => {
  const bgColor = useMemo(
    () => rgba(lighten(0.1, seedColor), 0.12),
    [seedColor]
  );
  const subtitleColor = useMemo(
    () => rgba(darken(0.3, seedColor), 0.35),
    [seedColor]
  );
  return (
    <NotifRow baseBg={bgColor} customBg={bgColor}>
      <Flex gap={2} flexDirection="column">
        <Text color={seedColor} fontSize={3} fontWeight={500}>
          {title}
        </Text>
        {subtitle && (
          <Text color={subtitleColor} fontSize={2} fontWeight={400}>
            {subtitle}
          </Text>
        )}
      </Flex>
      <Flex gap={8} alignItems="center">
        {onAction && (
          <TextButton
            textColor={seedColor}
            highlightColor={seedColor}
            fontSize={2}
            onClick={(evt: any) => {
              evt.stopPropagation();
              onAction(id);
            }}
          >
            {actionText}
          </TextButton>
        )}
        <IconButton
          customBg={bgColor}
          fontSize={2}
          onClick={(evt: any) => {
            evt.stopPropagation();
            onDismiss(id);
          }}
        >
          <Icons name="Close" />
        </IconButton>
      </Flex>
    </NotifRow>
  );
};

InnerNotification.defaultProps = {
  actionText: 'Accept',
};

// Local styles
const NotifRow = styled(Row)`
  border-radius: 12px;
  padding: 10px 12px;
  flex-grow: 1;
  justify-content: space-between;
  width: 100%;
`;
