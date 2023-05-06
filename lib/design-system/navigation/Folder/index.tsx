import React, { FC, useState } from 'react';

import { BoxProps, Flex, Icon, Row } from '../../general';

type FolderProps = {
  label: string;
  rightContent?: React.ReactNode;
  onToggleChildren?: (
    evt: React.MouseEvent<HTMLDivElement>,
    showChilden: boolean
  ) => void;
} & BoxProps;

export const Folder: FC<FolderProps> = (props: FolderProps) => {
  const { label, rightContent, onToggleChildren = () => {}, children } = props;

  const [showChildren, setShowChildren] = useState(false);

  return (
    <Flex gap={2} flexDirection="column" justifyContent="space-between">
      <Row
        onClick={(evt: React.MouseEvent<HTMLDivElement>) => {
          evt.stopPropagation();
          setShowChildren(!showChildren);
          onToggleChildren(evt, !showChildren);
        }}
      >
        <Flex
          flex={1}
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Flex gap={6} alignItems="center">
            <Icon name="Folder" size={14} opacity={0.4} />
            {label}
          </Flex>
          <Flex
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            gap={6}
          >
            {rightContent}
            <Icon
              name={showChildren ? 'ChevronUp' : 'ChevronDown'}
              size={18}
              opacity={0.4}
            />
          </Flex>
        </Flex>
      </Row>
      <Flex ml={2} gap={2} flexDirection="column">
        {showChildren && children}
      </Flex>
    </Flex>
  );
};
