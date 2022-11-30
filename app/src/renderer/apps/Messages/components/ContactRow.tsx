import { FC, MouseEvent, useState, useMemo, useCallback } from 'react';
import styled, { css } from 'styled-components';
import { darken } from 'polished';
import { motion } from 'framer-motion';
import { ThemeType } from '../../../theme';
import {
  Sigil,
  Flex,
  Box,
  Text,
  TextButton,
  Spinner,
} from 'renderer/components';
import {
  DMPreviewType,
  PreviewDMType,
  PreviewGroupDMType,
} from 'os/services/ship/models/courier';
import { Message } from './Message';
import { ThemeModelType } from 'os/services/theme.model';
import { DmActions } from 'renderer/logic/actions/chat';
import { fromNow } from '../helpers/time';
import { GroupSigil } from './GroupSigil';
import { ShipActions } from 'renderer/logic/actions/ship';

interface DMContact {
  theme: ThemeModelType;
  dm: DMPreviewType;
  onClick: (evt: any) => void;
}

interface RowProps {
  theme: ThemeType;
  customBg?: string;
  isPending?: boolean;
}

export const Row = styled(motion.div)<RowProps>`
  border-radius: 8px;
  width: calc(100% - 16px);
  padding: 8px;
  margin: 0 8px;
  gap: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  transition: ${(props: RowProps) => props.theme.transition};
  ${(props: RowProps) =>
    !props.isPending &&
    css`
      &:hover {
        transition: ${props.theme.transition};
        background-color: ${props.customBg
          ? darken(0.025, props.customBg)
          : 'initial'};
      }
    `}
`;

export const MessagePreview = styled(motion.div)`
  padding: 0px;
  line-height: 16px;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  user-select: text;
`;

export const ContactRow: FC<DMContact> = (props: DMContact) => {
  const { dm, theme, onClick } = props;
  const isGroup = dm.type === 'group' || dm.type === 'group-isPending';
  const isPending = dm.type === 'pending' || dm.type === 'group-isPending';

  const [acceptLoading, setAcceptLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  const dmModel = dm as PreviewDMType;
  const groupModel = dm as PreviewGroupDMType;
  const to = useMemo(
    () => (isGroup ? Array.from(groupModel.to).join(', ') : dmModel.to),
    [dmModel.to, groupModel.to, isGroup]
  );
  const lastTimeSent = useMemo(
    () => fromNow(dm.lastTimeSent),
    [dm.lastTimeSent]
  );

  const subTitle = useMemo(() => {
    if (isGroup) {
      let type = 'text';
      let lastMessage;
      if (dm.lastMessage.length > 0) {
        const lastSender = dm.lastMessage[0];
        lastMessage = dm.lastMessage[1];
        type = Object.keys(lastMessage)[0];
        // @ts-expect-error
        lastMessage = { text: `${lastSender.mention}: ${lastMessage[type]}` };
      } else {
        lastMessage = {
          text: isPending ? 'Group chat invite' : 'No messages yet',
        };
      }

      return <Message preview type={type} content={lastMessage} />;
    } else {
      if (isPending) {
        return (
          <Message
            preview
            type="text"
            content={{ text: 'invited you to chat' }}
          />
        );
      } else {
        let type = 'text';
        let lastMessage = dm.lastMessage[0];
        if (lastMessage) {
          type = Object.keys(lastMessage)[0];
        } else {
          lastMessage = { text: 'No messages yet' };
        }

        return <Message preview type={type} content={lastMessage} />;
      }
    }
  }, [dm.lastMessage, isGroup, isPending]);

  const sigil = useMemo(() => {
    if (isGroup) {
      return (
        <Box opacity={isPending ? 0.4 : 1}>
          <GroupSigil
            path={groupModel.path}
            patps={groupModel.to}
            metadata={groupModel.metadata}
          />
        </Box>
      );
    } else {
      return (
        <Box mt="2px" opacity={isPending ? 0.6 : 1}>
          <Sigil
            simple
            size={28}
            avatar={dmModel.metadata.avatar}
            patp={dmModel.to}
            color={[dmModel.metadata.color || '#000000', 'white']}
          />
        </Box>
      );
    }
  }, [
    dmModel.metadata.avatar,
    dmModel.metadata.color,
    dmModel.to,
    groupModel.metadata,
    groupModel.path,
    groupModel.to,
    isGroup,
    isPending,
  ]);

  const onAccept = useCallback(
    (evt: MouseEvent) => {
      evt.stopPropagation();
      setAcceptLoading(true);

      if (isGroup) {
        ShipActions.acceptGroupDm(groupModel.path)
          .then((response: any) => {
            console.log('accept ContactRow response', response);
            setAcceptLoading(false);
          })
          .catch(() => {
            setAcceptLoading(false);
          });
        console.log('accepting group dm');
      } else {
        ShipActions.acceptDm(dmModel.to)
          .then((response: any) => {
            console.log('accept ContactRow response', response);
            setAcceptLoading(false);
          })
          .catch(() => {
            setAcceptLoading(false);
          });
        console.log('accepting');
      }
    },
    [dmModel.to, groupModel.path, isGroup]
  );

  const onDecline = useCallback(
    (evt: MouseEvent) => {
      evt.stopPropagation();
      setRejectLoading(true);

      if (isGroup) {
        ShipActions.declineGroupDm(groupModel.path)
          .then((response: any) => {
            console.log('response', response);
            setRejectLoading(false);
          })
          .catch(() => {
            setRejectLoading(false);
          });
        console.log('rejecting group dm');
      } else {
        DmActions.declineDm(dmModel.to)
          .then((response: any) => {
            console.log('response', response);
            setRejectLoading(false);
          })
          .catch(() => {
            setRejectLoading(false);
          });
        console.log('rejecting');
      }
    },
    [dmModel.to, groupModel.path, isGroup]
  );

  return (
    <Row
      isPending={isPending}
      className={isPending ? '' : 'realm-cursor-hover'}
      customBg={theme.windowColor}
      onClick={(evt: any) => !isPending && onClick(evt)}
    >
      <Flex flex={1} gap={10} maxWidth="100%">
        {sigil}
        <Flex flexDirection="column" flex={1} overflow="hidden" minWidth={0}>
          <Text
            opacity={isPending ? 0.7 : 1}
            fontSize={3}
            fontWeight={500}
            height="19px"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {to}
          </Text>
          {subTitle}
        </Flex>
        {isPending ? (
          <Flex
            flex={1}
            flexDirection="row"
            alignItems="center"
            justifyContent="flex-end"
            width="fit-content"
          >
            <Flex gap={4} flexDirection="row" alignItems="center">
              <TextButton
                highlightColor="#EC415A"
                textColor="#EC415A"
                onClick={onDecline}
              >
                {rejectLoading ? <Spinner size={0} /> : 'Reject'}
              </TextButton>
              <TextButton onClick={onAccept}>
                {acceptLoading ? <Spinner size={0} /> : 'Accept'}
              </TextButton>
            </Flex>
          </Flex>
        ) : (
          <Flex
            gap={2}
            flexDirection="column"
            alignItems="flex-end"
            flexGrow={0}
          >
            <Text opacity={0.3} fontSize={2}>
              {lastTimeSent}
            </Text>
            <Flex
              px="10px"
              py="1px"
              justifyContent="center"
              alignItems="center"
              width="fit-content"
              borderRadius={12}
              height={20}
              minWidth={12}
              background={dm.unreadCount ? '#569BE2' : 'transparent'}
            >
              {dm.unreadCount > 0 && (
                <Text fontSize={2} color="white" fontWeight={400}>
                  {dm.unreadCount}
                </Text>
              )}
            </Flex>
          </Flex>
        )}
      </Flex>
    </Row>
  );
};
