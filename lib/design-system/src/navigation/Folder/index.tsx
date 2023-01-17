import React, { FC, useState } from 'react';
import { Flex, BoxProps, Icon, Row } from '../..';

type FolderProps = {
  label: string;
  onToggleChildren?: (
    evt: React.MouseEvent<HTMLButtonElement>,
    showChilden: boolean
  ) => void;
} & BoxProps;

export const Folder: FC<FolderProps> = (props: FolderProps) => {
  const { label, onToggleChildren = () => {}, children } = props;

  const [showChildren, setShowChildren] = useState(false);

  return (
    <Flex gap={2} flexDirection="column" justifyContent="space-between">
      <Row
        onClick={(evt: React.MouseEvent<HTMLButtonElement>) => {
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
          <Icon
            name={showChildren ? 'ChevronUp' : 'ChevronDown'}
            size={18}
            opacity={0.4}
          />
        </Flex>
      </Row>
      <Flex ml={2} gap={2} flexDirection="column">
        {showChildren && children}
      </Flex>
    </Flex>
  );
};
