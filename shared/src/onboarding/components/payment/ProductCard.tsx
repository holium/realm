import styled, { css } from 'styled-components';
import { Flex, Text } from '@holium/design-system';

const PlanCard = styled.div<{ isSelected: boolean }>`
  display: flex;
  flex: 1;
  gap: 10px;
  padding: 12px;
  border-radius: 6px;
  flex-direction: column;
  cursor: pointer;
  user-select: none;
  align-items: flex-start;
  border: 1px solid rgba(var(--rlm-border-rgba));
  background-color: rgba(var(--rlm-window-rgba));
  ${({ isSelected }) =>
    isSelected &&
    css`
      border: 1px solid rgba(var(--rlm-accent-rgba));
      background-color: rgba(var(--rlm-accent-rgba), 0.12);
    `};
`;

const PlanCardH2 = styled(Text.H2)<{ isSelected: boolean }>`
  font-size: 24px;
  font-weight: 600;
  line-height: 28px;
  color: ${({ isSelected }) =>
    isSelected ? 'rgba(var(--rlm-accent-rgba))' : 'rgba(var(--rlm-text-rgba))'};
`;

const PlanCardHint = styled(Text.Hint)<{ isSelected: boolean }>`
  font-size: 11px;
  color: ${({ isSelected }) =>
    isSelected
      ? 'rgba(var(--rlm-accent-rgba), 0.8)'
      : 'rgba(var(--rlm-text-rgba), 0.7)'};
`;

const PlanCardText = styled(Text.Body)<{ isSelected: boolean }>`
  font-size: 14px;
  color: ${({ isSelected }) =>
    isSelected
      ? 'rgba(var(--rlm-accent-rgba), 0.8)'
      : 'rgba(var(--rlm-text-rgba), 0.7)'};
`;

type Props = {
  h2Text: string;
  bodyText: string;
  hintText?: string;
  isSelected: boolean;
  onClick: () => void;
};

export const ProductCard = ({
  h2Text,
  bodyText,
  hintText,
  isSelected,
  onClick,
}: Props) => (
  <PlanCard isSelected={isSelected} onClick={onClick}>
    <Flex
      width="100%"
      gap={16}
      justifyContent="space-between"
      alignItems="self-end"
    >
      <PlanCardH2 isSelected={isSelected}>{h2Text}</PlanCardH2>
      {hintText && (
        <PlanCardHint isSelected={isSelected}>{hintText}</PlanCardHint>
      )}
    </Flex>
    <PlanCardText isSelected={isSelected}>{bodyText}</PlanCardText>
  </PlanCard>
);
