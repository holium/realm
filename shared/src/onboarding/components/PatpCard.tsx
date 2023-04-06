import styled, { css } from 'styled-components';
import { Flex, Text, Avatar } from '@holium/design-system';

const PatpCardView = styled(Flex)<{ isSelected: boolean }>`
  flex: 1;
  gap: 10px;
  height: 40px;
  padding: 7px 6px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  align-items: center;
  border: 1px solid rgba(var(--rlm-border-rgba));
  background-color: rgba(var(--rlm-window-rgba));
  ${({ isSelected }) =>
    isSelected &&
    css`
      border: 1px solid rgba(var(--rlm-accent-rgba), 0.4);
      background-color: rgba(var(--rlm-accent-rgba), 0.12);
    `};
`;

const PatpCardText = styled(Text.Body)<{ isSelected: boolean }>`
  user-select: none;
  color: rgba(var(--rlm-text-rgba));
  ${({ isSelected }) =>
    isSelected &&
    css`
      color: rgba(var(--rlm-accent-rgba));
      font-weight: 500;
    `};
`;

type Props = {
  patp: string;
  isSelected: boolean;
  onClick: () => void;
};

export const PatpCard = ({ patp, isSelected, onClick }: Props) => (
  <PatpCardView isSelected={isSelected} onClick={onClick}>
    <Avatar patp={patp} sigilColor={['black', 'white']} size={24} />
    <PatpCardText isSelected={isSelected}>{patp}</PatpCardText>
  </PatpCardView>
);
