import { FC, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { rgba, lighten, darken } from 'polished';
import { motion } from 'framer-motion';
import { ThemeType } from '../../../theme';
import { Sigil, Flex, Box, Text, TextButton } from 'renderer/components';
import { DMPreviewType } from 'os/services/ship/models/courier';
import { Message } from './Message';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { DmActions } from 'renderer/logic/actions/chat';
import { ShipActions } from 'renderer/logic/actions/ship';
import { cleanNounColor } from 'os/lib/color';
import moment from 'moment';
import { fromNow } from '../helpers/time';

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

export const ContactRow: FC<DMContact> = (props: DMContact) => {
  const { dm, theme, onClick } = props;
  // const { ship } = useShip();
  let subTitle;
  if (dm.pending) {
    const onAccept = (evt: any) => {
      evt.stopPropagation();
      DmActions.acceptDm(dm.to).then((response: any) => {
        console.log('accept ContactRow response', response);
      });
      console.log('accepting');
    };
    const onDecline = (evt: any) => {
      evt.stopPropagation();
      DmActions.declineDm(dm.to).then((response: any) => {
        console.log('response', response);
      });
      console.log('rejecting');
    };

    subTitle = (
      <Flex
        flex={1}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Message
          preview
          type={'text'}
          content={{ text: 'has invited you to a DM' }}
        />
        <Flex gap={4} flexDirection="row" alignItems="center">
          <TextButton
            highlightColor="#EC415A"
            textColor="#EC415A"
            onClick={onDecline}
          >
            Reject
          </TextButton>
          <TextButton onClick={onAccept}>Accept</TextButton>
        </Flex>
      </Flex>
    );
  } else {
    const lastMessage = dm.lastMessage[0];
    const type = Object.keys(lastMessage)[0];
    subTitle = <Message preview type={type} content={lastMessage} />;
  }

  const unread = false;

  return (
    <Row
      pending={dm.pending}
      className={dm.pending ? '' : 'realm-cursor-hover'}
      customBg={theme.windowColor}
      onClick={(evt: any) => !dm.pending && onClick(evt)}
    >
      <Flex flex={1} gap={10}>
        <Box mt="2px" opacity={dm.pending ? 0.5 : 1}>
          <Sigil
            simple
            size={28}
            avatar={dm.metadata.avatar}
            patp={dm.to}
            color={[dm.metadata.color || '#000000', 'white']}
          />
        </Box>
        <Flex flexDirection="column" flex={1}>
          <Text opacity={dm.pending ? 0.7 : 1} fontSize={3} fontWeight={500}>
            {dm.to}
          </Text>
          {subTitle}
        </Flex>
      </Flex>
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
    </Row>
  );
};
