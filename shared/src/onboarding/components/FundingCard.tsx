import styled from 'styled-components';

import { Flex, Text } from '@holium/design-system/general';

const FundingCardContainer = styled(Flex)<{ isSelected: boolean }>`
  width: 100%;
  display: flex;
  padding: 10px;
  align-items: flex-end;
  justify-content: space-between;
  border-radius: 9px;
  cursor: pointer;

  ${({ isSelected }) =>
    isSelected
      ? `
    background: rgba(67, 195, 95, 0.12);
    border: 1px solid #43C35F;
  `
      : `
    background: #F9F9F9;
    border: 1px solid #EBEBEB;
  `}
`;

const FundingCardLabel = styled(Text.Body)<{ isSelected: boolean }>`
  font-size: 14px;

  ${({ isSelected }) =>
    isSelected
      ? `
    color: rgba(67, 195, 95, 0.8);
  `
      : `
    color: rgba(51, 51, 51, 0.70);
  `}
`;

const FundingCardEthPrice = styled(Text.Body)<{ isSelected: boolean }>`
  font-size: 24px;
  font-style: normal;
  font-weight: 600;

  ${({ isSelected }) =>
    isSelected
      ? `
    color: #43c35f;
  `
      : `
    color: var(--rlm-text-color);
  `}
`;

const FundingCardUsdPrice = styled(Text.Body)`
  color: rgba(85, 100, 118, 0.6);
  text-align: right;
  font-size: 13px;
  font-style: normal;
  line-height: 20px;
  letter-spacing: 0.26px;
  text-transform: uppercase;
`;

type Props = {
  label: string;
  ethPrice: string;
  usdPrice: string;
  isSelected: boolean;
  onClick: () => void;
};

export const FundingCard = ({
  label,
  ethPrice,
  usdPrice,
  isSelected,
  onClick,
}: Props) => (
  <FundingCardContainer isSelected={isSelected} onClick={onClick}>
    <Flex flexDirection="column" gap={2}>
      <FundingCardLabel
        as="label"
        htmlFor="eth-address"
        isSelected={isSelected}
      >
        {label}
      </FundingCardLabel>
      <FundingCardEthPrice isSelected={isSelected}>
        {ethPrice}
      </FundingCardEthPrice>
    </Flex>
    <FundingCardUsdPrice>{usdPrice}</FundingCardUsdPrice>
  </FundingCardContainer>
);
