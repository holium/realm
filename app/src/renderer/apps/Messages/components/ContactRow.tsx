import { FC, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { rgba, lighten, darken } from 'polished';
import { toJS } from 'mobx';
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
import { ThemeModelType } from 'os/services/shell/theme.model';
import { DmActions } from 'renderer/logic/actions/chat';
import { fromNow } from '../helpers/time';
import { GroupSigil } from './GroupSigil';
import { Patp } from 'os/types';

type DMContact = {
  theme: ThemeModelType;
  dm: DMPreviewType;
  onClick: (evt: any) => void;
};

type RowProps = {
  theme: ThemeType;
  customBg?: string;
  pending?: boolean;
};

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
    !props.pending &&
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

const getNickname = (patp: Patp, metadata: any[]) => {};

export const ContactRow: FC<DMContact> = (props: DMContact) => {
  const { dm, theme, onClick } = props;
  // const { ship } = useShip();
  const pending = dm.type === 'pending';
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  let onAccept,
    onDecline,
    subTitle,
    sigil,
    to: string,
    dmModel: PreviewDMType,
    groupModel: PreviewGroupDMType;

  if (dm.type === 'group') {
    groupModel = dm as PreviewGroupDMType;
    to = Array.from(groupModel.to).join(', ');
    sigil = (
      <GroupSigil
        path={groupModel.path}
        patps={groupModel.to}
        metadata={groupModel.metadata}
      />
    );
    let type = 'text',
      lastMessage;
    if (dm.lastMessage.length > 0) {
      let lastSender = dm.lastMessage[0];
      lastMessage = dm.lastMessage[1];
      type = Object.keys(lastMessage)[0];
      // @ts-ignore
      lastMessage = { text: `${lastSender.mention}: ${lastMessage[type]}` };
    } else {
      lastMessage = { text: 'No messages yet' };
    }
    subTitle = <Message preview type={type} content={lastMessage} />;
  } else {
    dmModel = dm as PreviewDMType;
    to = dmModel.to;
    sigil = (
      <Box mt="2px" opacity={pending ? 0.6 : 1}>
        <Sigil
          simple
          size={28}
          avatar={dmModel.metadata.avatar}
          patp={dmModel.to}
          color={[dmModel.metadata.color || '#000000', 'white']}
        />
      </Box>
    );
    onAccept = (evt: any) => {
      evt.stopPropagation();
      setAcceptLoading(true);
      DmActions.acceptDm(dmModel.to)
        .then((response: any) => {
          console.log('accept ContactRow response', response);
          setAcceptLoading(false);
        })
        .catch(() => {
          setAcceptLoading(false);
        });
      console.log('accepting');
    };
    onDecline = (evt: any) => {
      evt.stopPropagation();
      setRejectLoading(true);
      DmActions.declineDm(dmModel.to)
        .then((response: any) => {
          console.log('response', response);
          setRejectLoading(false);
        })
        .catch(() => {
          setRejectLoading(false);
        });
      console.log('rejecting');
    };
    if (pending) {
      subTitle = (
        <Message
          preview
          type="text"
          content={{ text: 'invited you to chat' }}
        />
      );
    } else {
      let lastMessage = dm.lastMessage[0];
      let type = 'text';
      if (lastMessage) {
        type = Object.keys(lastMessage)[0];
      } else {
        lastMessage = { text: 'No messages yet' };
      }
      subTitle = <Message preview type={type} content={lastMessage} />;
    }
  }

  const unread = false;

  return (
    <Row
      pending={pending}
      className={pending ? '' : 'realm-cursor-hover'}
      customBg={theme.windowColor}
      onClick={(evt: any) => !pending && onClick(evt)}
    >
      <Flex flex={1} gap={10}>
        {sigil}
        <Flex flexDirection="column" flex={1}>
          <Text opacity={pending ? 0.7 : 1} fontSize={3} fontWeight={500}>
            {to}
          </Text>
          {subTitle}
        </Flex>
      </Flex>
      {pending ? (
        <Flex
          flex={1}
          flexDirection="row"
          alignItems="center"
          justifyContent="flex-end"
          width="fit-content"
        >
          {/* <Message
            preview
            type={'text'}
            content={{ text: 'has invited you to a DM' }}
          /> */}
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
        <Flex gap={2} flexDirection="column" alignItems="flex-end" flexGrow={0}>
          <Text opacity={0.3} fontSize={2}>
            {fromNow(dm.lastTimeSent)}
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
            background={unread ? '#569BE2' : 'transparent'}
          >
            {unread && (
              <Text fontSize={2} color="white" fontWeight={500}>
                1
              </Text>
            )}
          </Flex>
        </Flex>
      )}
    </Row>
  );
};
