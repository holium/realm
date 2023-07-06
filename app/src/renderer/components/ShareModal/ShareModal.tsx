import styled from 'styled-components';

import {
  Bubble,
  Button,
  Card,
  CheckBox,
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

const ShareButton = styled(Button.IconButton)`
  height: 30px;
  width: 30px;
  &:hover:not([disabled]) {
    background: rgba(var(--rlm-accent-rgba), 0.12);
  }
`;

const BubbleWrapper = styled(Flex)`
  width: 90%;
  margin-left: 8px;
  margin-bottom: 8px;
  & > div {
    flex-grow: 2;
  }
`;

const ShareTo = styled(Flex)`
  margin: 8px;
  & > hr {
    border: none;
    flex-grow: 2;
    height: 1px;
    margin-top: 8px;
    margin-left: 8px;
    background-color: #3333331a;
  }
  & > div {
    color: rgba(var(--rlm-text-rgba), 0.4);
    text-align: center;
    font-size: 14px;
    font-family: Rubik;
    font-weight: 500;
  }
`;

export const ShareModal = () => {
  const { object, colors, paths, setPaths } = useShareModal();

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
          backgroundColor: 'rgba(var(--rlm-window-bg-rgba))',
        }}
      >
        <Flex
          justifyContent="space-between"
          style={{ padding: '8px', paddingBottom: '16px' }}
          alignItems="center"
        >
          <Flex gap={8}>
            <Icon
              name={object.icon}
              size={44}
              fill="text"
              opacity={0.3}
              style={{
                padding: '4px',
                borderRadius: '6px',
                border: '2px solid var(--rlm-border-color)',
                background: '#FFFfff',
              }}
            />
            <Flex col={true}>
              <Text.H2
                color={colors.textColor}
                fontSize={16}
                lineHeight={21}
                fontWeight={500}
              >
                {object.app}
              </Text.H2>
              <Text.Label
                opacity={0.7}
                fontSize={13}
                lineHeight={18}
                fontWeight={300}
              >
                Share {object.dataTypeName}
              </Text.Label>
            </Flex>
          </Flex>
          <ShareButton
            disabled={paths.find((p) => p.selected) ? undefined : true}
            height="30px"
            width="30px"
            background="rgba(var(--rlm-accent-rgba), 0.12)"
            onClick={() =>
              object.share(
                object,
                paths.filter((p) => p.selected)
              )
            }
          >
            <Icon
              name="ShareArrow"
              size={30}
              mt={1}
              ml={2}
              style={{ fill: '#4E9EFD' }}
            />
          </ShareButton>
        </Flex>

        {object.message && (
          <BubbleWrapper>
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
              forwardedFrom={object.message.forwardedFrom}
            />
          </BubbleWrapper>
        )}

        <ShareTo>
          <Text.Label>Share to</Text.Label>
          <hr />
        </ShareTo>

        {paths.map((p) => (
          <PathRow
            key={p.path}
            pathObj={p}
            toggle={(path: string, selected: boolean) => {
              setPaths(
                paths.map((i) => (i.path === path ? { ...i, selected } : i))
              );
            }}
          />
        ))}
      </Card>
    </Portal>
  );
};

export const PathRow = ({
  pathObj,
  toggle,
}: {
  pathObj: SharePath;
  toggle: (path: string, selected: boolean) => void;
}) => {
  return (
    <Row>
      <Flex width="36px">
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
      </Flex>
      <Flex col={true} flexGrow={2}>
        <Text.Custom fontSize="15px" fontWeight={500}>
          {pathObj.space ? pathObj.space.name : pathObj.title}
        </Text.Custom>
        {pathObj.space && (
          <Flex gap={4}>
            <Icon name="Members" size={14} fill="text" opacity={0.6} />
            <Text.Custom opacity={0.6} fontSize="13px" fontWeight={400}>
              {pathObj.space.members.count} members
            </Text.Custom>
          </Flex>
        )}
      </Flex>
      <CheckBox
        isChecked={pathObj.selected}
        onChange={(v) => toggle(pathObj.path, v)}
        size={24}
      />
    </Row>
  );
};
