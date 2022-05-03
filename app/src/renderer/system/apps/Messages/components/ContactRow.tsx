import { FC } from 'react';
import styled from 'styled-components';
import { rgba, lighten, darken } from 'polished';
import { motion } from 'framer-motion';
import { ThemeType } from '../../../../theme';
import { Sigil, Flex, Box, Text } from '../../../../components';
import { ChatType } from '../../../../logic/ship/chat/store';
import { Message } from './Message';
import { WindowThemeType } from '../../../../logic/stores/config';

type DMContact = {
  // theme: ThemeType;
  theme: WindowThemeType;
  dm: ChatType;
  onClick: (evt: any) => void;
};

type RowProps = {
  theme: ThemeType;
  customBg?: string;
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
  cursor: pointer;
  transition: ${(props: RowProps) => props.theme.transition};
  &:hover {
    transition: ${(props: RowProps) => props.theme.transition};
    background-color: ${(props: RowProps) =>
      props.customBg ? lighten(0.25, props.customBg) : 'initial'};
  }
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
  const lastMessage = dm.messages[0];
  return (
    <Row customBg={theme.backgroundColor} onClick={(evt: any) => onClick(evt)}>
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
        <Message
          preview
          type={lastMessage.type}
          content={lastMessage.content}
        />
      </Flex>
    </Row>
  );
};
