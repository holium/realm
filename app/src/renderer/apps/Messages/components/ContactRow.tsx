import { FC } from 'react';
import styled, { css } from 'styled-components';
import { useShip } from 'renderer/logic/store';
import { rgba, lighten, darken } from 'polished';
import { motion } from 'framer-motion';
import { ThemeType } from '../../../theme';
import { Sigil, Flex, Box, Text, TextButton } from 'renderer/components';
import { ChatType } from 'renderer/logic/ship/chat/store';
import { Message } from './Message';
import { WindowThemeType } from 'renderer/logic/stores/config';

type DMContact = {
  theme: WindowThemeType;
  dm: ChatType;
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
          ? lighten(0.02, props.customBg)
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
      dm.acceptDm().then((response: any) => {
        console.log('accept ContactRow response', response);
      });
      console.log('accepting');
    };
    const onDecline = (evt: any) => {
      evt.stopPropagation();
      dm.declineDm().then((response: any) => {
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
    const lastMessage = dm.messages[0].contents[0];
    const type = Object.keys(lastMessage)[0];
    subTitle = <Message preview type={type} content={lastMessage} />;
  }
  return (
    <Row
      pending={dm.pending}
      className={dm.pending ? '' : 'realm-cursor-hover'}
      customBg={theme.windowColor}
      onClick={(evt: any) => !dm.pending && onClick(evt)}
    >
      <Box opacity={dm.pending ? 0.5 : 1}>
        <Sigil
          simple
          size={28}
          avatar={dm.avatar}
          patp={dm.contact}
          color={[dm.sigilColor || '#000000', 'white']}
        />
      </Box>
      <Flex flexDirection="column" flex={1}>
        <Text opacity={dm.pending ? 0.7 : 1} fontSize={3} fontWeight={500}>
          {dm.contact}
        </Text>
        {subTitle}
      </Flex>
    </Row>
  );
};
