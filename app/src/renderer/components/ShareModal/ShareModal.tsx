import {
  Bubble,
  Button,
  Card,
  Flex,
  Icon,
  Portal,
  Row,
  Text,
} from '@holium/design-system';

import { ChatAvatar } from 'renderer/apps/Courier/components/ChatAvatar';

import { SharePath, useShareModal } from './useShareModal';

const WIDTH = 340;
const HEIGHT = 470;

export const ShareModal = () => {
  const { object, colors, paths } = useShareModal();

  if (!object) return <div />;

  return (
    <Portal>
      <Card
        id="share-modal"
        p={1}
        elevation={2}
        position="absolute"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
          transition: {
            duration: 0.1,
          },
        }}
        exit={{
          opacity: 0,
          y: 8,
          transition: {
            duration: 0.1,
          },
        }}
        style={{
          y: (window.innerHeight - HEIGHT) / 2,
          x: (window.innerWidth - WIDTH) / 2,
          width: WIDTH,
          maxHeight: HEIGHT,
          overflowY: 'auto',
          backgroundColor: colors.windowColor,
        }}
      >
        <Flex gap={8}>
          <Icon name={object.icon} size={40} fill="text" opacity={0.3} />
          <Flex col={true} flexGrow={2}>
            <Text.H2 color={colors.textColor} fontSize={16} pb="2px">
              {object.app}
            </Text.H2>
            <Text.Label color={colors.textColor} fontSize={13}>
              Share {object.dataTypeName}
            </Text.Label>
          </Flex>
          <Button.IconButton height="30px" width="30px" background="#4E9EFD1F">
            <Icon
              name="ShareArrow"
              size={30}
              mt={1}
              ml={1}
              style={{ fill: '#4E9EFD' }}
            />
          </Button.IconButton>
        </Flex>
        {object.message && (
          <Bubble
            id={`message-row-${object.message.id}`}
            isPrevGrouped={false}
            isNextGrouped={false}
            expiresAt={object.message.expiresAt}
            themeMode={'light'}
            isOur={false}
            ourColor={'black'}
            isEditing={false}
            isDeleting={false}
            updatedAt={object.message.updatedAt}
            isEdited={object.message.metadata.edited}
            author={object.message.sender}
            message={object.mergedContents}
            sentAt={new Date(object.message.createdAt).toISOString()}
            error={object.message.error}
          />
        )}
        <Flex>
          <Text.Label>Share to</Text.Label>
          <hr />
        </Flex>
        {paths.map((p) => (
          <PathRow key={p.path} pathObj={p} />
        ))}
      </Card>
    </Portal>
  );
};

export const PathRow = ({ pathObj }: { pathObj: SharePath }) => {
  return (
    <Row>
      <ChatAvatar
        sigil={pathObj.sigil}
        type={pathObj.type}
        path={pathObj.path}
        peers={pathObj.peers}
        image={pathObj.image}
        color={pathObj.space?.color}
        metadata={pathObj.metadata}
        canEdit={false}
      />
      <Text.Label>{pathObj.title}</Text.Label>
    </Row>
  );
};
