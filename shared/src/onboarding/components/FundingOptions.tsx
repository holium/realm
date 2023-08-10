import { Flex } from '@holium/design-system/general';

import { FundingCard } from './FundingCard';

export type FundingOption = {
  label: string;
  ethPrice: string;
  usdPrice: string;
};

export const FUNDING_OPTIONS: FundingOption[] = [
  {
    label: 'One month',
    ethPrice: '0.0080 ETH',
    usdPrice: '$15.00 USD',
  },
  {
    label: 'One year',
    ethPrice: '0.080 ETH',
    usdPrice: '$150.00 USD',
  },
  {
    label: 'Lifetime',
    ethPrice: '2.125 ETH',
    usdPrice: '$4,000.00 USD',
  },
];

type Props = {
  fundingOption: FundingOption;
  setFundingOption: (option: FundingOption) => void;
};

export const FundingOptions = ({ fundingOption, setFundingOption }: Props) => (
  <Flex flexDirection="column" gap="8px">
    {FUNDING_OPTIONS.map((option, index) => (
      <FundingCard
        key={index}
        label={option.label}
        ethPrice={option.ethPrice}
        usdPrice={option.usdPrice}
        isSelected={fundingOption === option}
        onClick={() => setFundingOption(option)}
      />
    ))}
  </Flex>
);
