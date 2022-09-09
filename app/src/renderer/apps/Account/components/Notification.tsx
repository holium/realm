import { darken, rgba } from 'polished';
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
import { FC, useEffect } from 'react';
import { useServices } from 'renderer/logic/store';

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
      token = <Mention patp={content.ship} />;
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
  const { ship } = useServices();

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
        {/* <Flex alignItems="center" mr={3}>
          <img
            style={{
              borderRadius: 6,
              // border: props.color
              //   ? `1px solid ${rgba(darken(0.4, props.color), 0.1)}`
              //   : 'none',
            }}
            width={48}
            height={48}
            src={props.image}
          />
        </Flex> */}
        <Flex gap={1} justifyContent="center" flexDirection="column">
          <Flex gap={6}>
            {props.title.map((content: ContentType, index: number) => (
              <NotifTitle
                key={`title-${index}`}
                fontSize={2}
                content={content}
              />
            ))}
          </Flex>
          <Flex mt={1} justifyContent="space-between">
            {props.content.map((content: ContentType, index: number) => (
              <NotifTitle
                key={`content-${index}`}
                fontSize={2}
                fontOpacity={0.5}
                content={content}
              />
            ))}
          </Flex>
        </Flex>
        <Flex justifyContent="center" alignItems="center">
          <IconButton>
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
    <EmbedBox
      className="realm-cursor-hover"
      mb={2}
      p={3}
      pr={3}
      justifyContent="space-between"
      // customBg={}
      // customTextColor={}
      // seen={props.seen}
      onClick={(evt: any) => {
        evt.preventDefault();
        // TODO make this open groups app and load url
      }}
    >
      {innerContent}
    </EmbedBox>
  );
};
