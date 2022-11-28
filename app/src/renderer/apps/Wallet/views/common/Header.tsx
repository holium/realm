import { FC } from 'react';
import { Icons, Flex, RadioGroup, IconButton } from 'renderer/components';
import { WalletActions } from 'renderer/logic/actions/wallet';

type Network = 'ethereum' | 'bitcoin';

interface WalletHeader {
  showBack: boolean;
  theme: {
    iconColor: string;
    windowColor: string;
    textColor: string;
  };
  network: Network | string;
  onSetNetwork: (network: Network) => void;
  onAddWallet: () => void;
  hide: boolean;
}

export const WalletHeader: FC<WalletHeader> = (props: WalletHeader) => {
  const { showBack, network, onSetNetwork, onAddWallet } = props;
  const { windowColor, textColor, iconColor } = props.theme;
  return (
    <Flex
      width="100%"
      justifyContent="space-between"
      alignItems="center"
      pl={3}
      pr={3}
      // height={48}
      pt="8px"
    >
      {showBack ? (
        <IconButton onClick={async () => await WalletActions.navigateBack()}>
          <Icons name="ArrowLeftLine" size={1} color={iconColor} />
        </IconButton>
      ) : (
        <Flex justifyContent="center" alignItems="center" width="24px">
          <Icons name="WalletNew" size="20px" opacity={0.7} />
        </Flex>
      )}

      {props.hide ? (
        <></>
      ) : (
        <>
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
        </>
      )}
    </Flex>
  );
};
