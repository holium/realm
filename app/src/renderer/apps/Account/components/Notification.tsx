import { darken, lighten, rgba } from 'polished';
import styled from 'styled-components';
import {
  Flex,
  EmbedBox,
  Text,
  Skeleton,
  Mention,
  IconButton,
  Icons,
} from 'renderer/components';
import { Row } from 'renderer/components/NewRow';

import { FC, useEffect, useMemo } from 'react';
import { useServices } from 'renderer/logic/store';
import { motion } from 'framer-motion';

const EmptyIcon = styled.div`
  height: 48px;
  width: 48px;
  background: ${(p) => p.color || 'lightgray'};
  border-radius: 6px;
`;

type ContentType = { [key: string]: string };
interface NotificationProps {
  loading?: boolean;
  dismissed?: boolean;
  image?: string;
  title: ContentType[];
  content: ContentType[];
  seen?: boolean;
  link: string;
  time: string;
  ship: string;
  app: string;
}

interface NotifTitleProps {
  content: ContentType;
  fontSize?: number;
  fontOpacity?: number;
  bold?: boolean;
}

const NotifTitle: FC<NotifTitleProps> = (props: NotifTitleProps) => {
  const { content, fontSize, fontOpacity } = props;
  let token: any = [];
  switch (Object.keys(content)[0]) {
    case 'text':
      const trimmed =
        content.text.length > 43
          ? content.text.substring(0, 44) + '...'
          : content.text;
      token = (
        <Text fontWeight={400} opacity={fontOpacity} fontSize={fontSize}>
          {trimmed}
        </Text>
      );
      break;
    case 'ship':
      token = <Mention height={19} mb={2} patp={content.ship} />;
      break;
    default:
      token = (
        <Text fontWeight={400} opacity={fontOpacity} fontSize={fontSize}>
          {Object.values(content)[0]}
        </Text>
      );
      break;
  }
  return token;
};

export const Notification = (props: NotificationProps) => {
  let innerContent: React.ReactNode;
  const seedColor = '#4E9EFD';

  const bgColor = useMemo(
    () => rgba(lighten(0.1, seedColor), 0.12),
    [seedColor]
  );
  const subtitleColor = useMemo(
    () => rgba(darken(0.3, seedColor), 0.35),
    [seedColor]
  );

  useEffect(() => {
    // ship?.notifications.setSeen(props.link);
  }, []);
  if (props.loading) {
    innerContent = (
      <>
        {/* <Flex alignItems="center" mr={3}>
          <Skeleton style={{ borderRadius: 6 }} height={48} width={48} />
        </Flex> */}
        <Flex gap={8} flex={1} justifyContent="center" flexDirection="column">
          <Flex justifyContent="space-between">
            <Skeleton height={14} width={150} />
            <Skeleton height={14} width={30} />
          </Flex>
          <Flex justifyContent="space-between">
            <Skeleton height={14} width={200} />
          </Flex>
        </Flex>
      </>
    );
  } else {
    innerContent = (
      <>
        <motion.div style={{ display: 'inline-grid' }}>
          <motion.div
            style={{
              margin: 0,
              display: '-webkit-inline-box',
              verticalAlign: 'middle',
              gap: 4,
              alignItems: 'center',
            }}
          >
            {props.title.map((content: ContentType, index: number) => (
              <NotifTitle
                key={`title-${index}`}
                fontSize={2}
                content={content}
              />
            ))}
          </motion.div>
          <motion.div style={{ display: '-webkit-inline-box' }}>
            {props.content.map((content: ContentType, index: number) => (
              <NotifTitle
                key={`content-${index}`}
                fontSize={2}
                fontOpacity={0.5}
                content={content}
              />
            ))}
          </motion.div>
        </motion.div>
        <Flex justifyContent="center" alignItems="center">
          <IconButton
            customBg={bgColor}
            onClick={(evt: any) => {
              evt.stopPropagation();
              // onDismiss(id);
            }}
          >
            <Icons name="Close" />
          </IconButton>
        </Flex>
      </>
    );
  }

  const colors = {
    customBg: '',
    customTextColor: '',
  };
  if (props.seen) {
  }

  return (
    <NotifRow
      className="realm-cursor-hover"
      // p={3}
      // pr={3}
      baseBg={bgColor}
      customBg={bgColor}
      // customBg={}
      // customTextColor={}
      // seen={props.seen}
      onClick={(evt: any) => {
        evt.preventDefault();
        // TODO make this open groups app and load url
      }}
    >
      {innerContent}
    </NotifRow>
  );
};

const NotifRow = styled(Row)`
  border-radius: 12px;
  /* padding: 10px 12px; */
  margin-bottom: 4px;
  padding: 12px;
  justify-content: space-between;
  width: 100%;
`;
