import { findLastKey } from 'lodash';
import { lastIndexOfFrom } from 'lodash/fp';
import { FC } from 'react';
import { Icons, Flex, Text, RadioGroup, IconButton } from 'renderer/components';

type Network = 'ethereum' | 'bitcoin';

interface WalletHeader {
  theme: {
    windowColor: string;
    textColor: string;
  };
  network: Network | string;
  onSetNetwork: (network: Network) => void;
  onAddWallet: () => void;
}

export const WalletHeader: FC<WalletHeader> = (props: WalletHeader) => {
  const { network, onSetNetwork, onAddWallet } = props;
  const { windowColor, textColor } = props.theme;
  // WalletNew;
  return (
    <Flex
      width="100%"
      justifyContent="space-between"
      alignItems="center"
      pl={3}
      pr={3}
      pt="6px"
      pb="6px"
      // height="40px"
    >
      <Icons name="WalletNew" size="20px" opacity={0.7} />
      <RadioGroup
        customBg={windowColor}
        textColor={textColor}
        selected={network}
        options={[
          {
            label: 'Bitcoin',
            icon: 'Bitcoin',
            value: 'bitcoin',
            highlightColor: '#F7931A',
          },
          {
            label: 'Ethereum',
            icon: 'Ethereum',
            value: 'ethereum',
            highlightColor: '#627EEA',
          },
        ]}
        onClick={(value: Network) => {
          onSetNetwork(value);
        }}
      />
      <IconButton onClick={onAddWallet}>
        <Icons name="Plus" />
      </IconButton>
    </Flex>
  );
};
