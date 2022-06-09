import { FC } from 'react';
import styled, { css } from 'styled-components';
// import { As} from 'styled-system'
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
  disabled?: boolean;
};

// export const Bubble = styled(motion.div)`

// `;
export const Row = styled(motion.div)<RowProps>`
  border-radius: 8px;
  width: calc(100% - 16px);
  padding: 8px;
  margin: 0 8px;
  gap: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  // cursor: pointer;
  list-style-type: none;
  transition: ${(props: RowProps) => props.theme.transition};
  ${(props: RowProps) =>
    !props.disabled &&
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
  let subTitle;
  if (dm.pending) {
    const onReject = (evt: any) => {
      evt.stopPropagation();
      console.log('rejecting');
    };
    const onAccept = (evt: any) => {
      evt.stopPropagation();
      console.log('accepting');
    };
    subTitle = (
      <Flex
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Message
          preview
          type={'text'}
          content={{ text: `${dm.contact} has invited you to a DM` }}
        />
        <Flex gap={1} ml={2} flexDirection="row" alignItems="center">
          <TextButton
            highlightColor="#D0384E"
            textColor="#D0384E"
            onClick={onReject}
          >
            Reject
          </TextButton>
          <TextButton onClick={onAccept}>Accept</TextButton>
        </Flex>
      </Flex>
    );
  } else {
    const lastMessage = dm.messages[0];
    subTitle = (
      <Message preview type={lastMessage.type} content={lastMessage.content} />
    );
  }
  return (
    <Row
      disabled={dm.pending}
      className={dm.pending ? '' : 'realm-cursor-hover'}
      customBg={theme.windowColor}
      onClick={(evt: any) => !dm.pending && onClick(evt)}
    >
      <Box>
        <Sigil
          simple
          size={28}
          avatar={null}
          patp={dm.contact}
          color={['#000000', 'white']}
        />
      </Box>
      <Flex flexDirection="column">
        <Text fontSize={3} fontWeight={500} mb="2px">
          {dm.contact}
        </Text>
        {subTitle}
      </Flex>
    </Row>
  );
};
