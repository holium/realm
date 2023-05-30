import styled from 'styled-components';

import { Flex, Text } from '@holium/design-system/general';

import { RealmCursorIcon } from './RealmCursorIcon';
import { SystemCursorIcon } from './SystemCursorIcon';

type CursorOptionProps = {
  type: 'Realm' | 'System';
  isSelected: boolean;
  onClick: () => void;
};

export const CursorOption = ({
  type,
  isSelected,
  onClick,
}: CursorOptionProps) => (
  <Flex flexDirection="column" gap="6px">
    <CursorOptionBox isSelected={isSelected} onClick={onClick}>
      {type === 'Realm' ? <RealmCursorIcon /> : <SystemCursorIcon />}
    </CursorOptionBox>
    <Text.Label textAlign="center" style={{ fontSize: 12, fontWeight: 400 }}>
      {type}
    </Text.Label>
  </Flex>
);

const CursorOptionBox = styled(Flex)<{
  isSelected: boolean;
}>`
  width: 56px;
  height: 56px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--rlm-border-color);
  border-radius: 6px;
  cursor: pointer;

  ${({ isSelected }) =>
    isSelected &&
    `
    border-color: var(--rlm-accent-color);
    background-color: rgba(var(--rlm-accent-rgba), 0.1);
  `}
`;
