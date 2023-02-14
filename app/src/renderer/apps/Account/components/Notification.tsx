import { useMemo } from 'react';
import { observer } from 'mobx-react';
import { lighten, rgba } from 'polished';
import styled from 'styled-components';
import { Flex, Text, Skeleton, Mention } from 'renderer/components';
import { Row } from 'renderer/components/NewRow';

import { motion } from 'framer-motion';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { openDMsToChat } from 'renderer/logic/lib/useTrayControls';

interface ContentType {
  [key: string]: string;
}

export interface NotificationProps {
  loading?: boolean;
  dismissed?: boolean;
  image?: string;
  title?: ContentType[];
  content: any;
  seen?: boolean;
  inbox?: string;
  desk?: string;
  link?: string;
  time: number;
  ship?: string;
  app?: string;
}

interface NotifTitleProps {
  content: ContentType;
  fontSize?: number;
  fontOpacity?: number;
  bold?: boolean;
}

const NotifTitle = ({ content, fontSize, fontOpacity }: NotifTitleProps) => {
  let token: any = [];
  switch (Object.keys(content)[0]) {
    case 'text':
      const trimmed =
        content.text.length > 43
          ? content.text.substring(0, 44) + '...'
          : content.text;
      token = (
        <Text
          paddingLeft={'3px'}
          paddingRight={'3px'}
          fontWeight={400}
          opacity={fontOpacity}
          fontSize={fontSize}
        >
          {trimmed}
        </Text>
      );
      break;
    case 'ship':
      token = <Mention height={19} mb={2} patp={content.ship} />;
      break;
    case 'emph':
      token = (
        <Text
          paddingLeft={'3px'}
          paddingRight={'3px'}
          fontWeight={'bold'}
          opacity={fontOpacity}
          fontSize={fontSize}
        >
          {Object.values(content)[0]}
        </Text>
      );
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

const NotificationPresenter = (props: NotificationProps) => {
  let innerContent: React.ReactNode;
  const seedColor = '#4E9EFD';
  const { dmApp, setActiveApp } = useTrayApps();
  const { courier } = useServices();

  const bgColor = useMemo(
    () =>
      props.seen
        ? rgba(lighten(0.1, '#a1a1a1'), 0.12)
        : rgba(lighten(0.1, seedColor), 0.12),
    [seedColor && props.seen]
  );

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
          {props.title && (
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
          )}
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
          {/* <IconButton
            customBg={bgColor}
            onClick={(evt: any) => {
              evt.stopPropagation();
              // onDismiss(id);
            }}
          >
            <Icons name="Close" />
          </IconButton> */}
        </Flex>
      </>
    );
  }

  return (
    <Flex pb={1}>
      <NotifRow
        className="realm-cursor-hover"
        baseBg={bgColor}
        customBg={bgColor}
        onClick={(evt: any) => {
          evt.stopPropagation();
          // TODO make this open dm and load url
          if (props.inbox?.includes('dm')) {
            const inbox = props.inbox.split('/');
            let path: string = '';
            Array.from(courier.dms.keys()).forEach((key) => {
              if (key.includes(inbox[2])) {
                path = key;
              }
            });
            if (!path) return;
            // ShipActions.draftDm()
            const dmPreview = courier.previews.get(path)!;
            openDMsToChat(dmApp, dmPreview, setActiveApp);
          }
          evt.preventDefault();
        }}
      >
        {innerContent}
      </NotifRow>
    </Flex>
  );
};

export const Notification = observer(NotificationPresenter);

const NotifRow = styled(Row)`
  border-radius: 12px;
  padding: 12px;
  justify-content: space-between;
  width: 100%;
`;
