import { CheckBox, Flex, Icon, Row, Text } from '@holium/design-system';

import { ChatAvatar } from 'renderer/apps/Courier/components/ChatAvatar';

import { SharePath } from './useShareModal';

type Props = {
  pathObj: SharePath;
  toggle: (path: string, selected: boolean) => void;
};

export const ShareModalPathRow = ({ pathObj, toggle }: Props) => (
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
