import { useMemo } from 'react';
import { rgba } from 'polished';
import { Icons, Flex, IconButton, Text } from 'renderer/components';
import { WalletActions } from 'renderer/logic/actions/wallet';

type Network = 'ethereum' | 'bitcoin';

type Props = {
  showBack: boolean;
  isOnboarding: boolean;
  theme: {
    iconColor: string;
    windowColor: string;
    textColor: string;
  };
  network: Network | string;
  onSetNetwork: (network: Network) => void;
  onAddWallet: () => void;
  hide: boolean;
};

export const WalletHeader = ({
  theme,
  hide,
  showBack,
  isOnboarding,
  onAddWallet,
}: Props) => {
  const { iconColor } = theme;
  const ethBg = useMemo(() => rgba('#627EEA', 0.1), []);

  if (hide) return null;

  return (
    <Flex
      width="100%"
      justifyContent="space-between"
      alignItems="center"
      pl={3}
      pr={3}
      pt={3}
      // height={40}
      pb={2}
    >
      {showBack && !isOnboarding ? (
        <IconButton
          mt={isOnboarding ? 1 : 0}
          onClick={async () => await WalletActions.navigateBack()}
        >
          <Icons name="ArrowLeftLine" size={1} color={iconColor} />
        </IconButton>
      ) : (
        <Flex
          mt={isOnboarding ? 1 : 0}
          justifyContent="center"
          alignItems="center"
          width="24px"
        >
          <Icons name="WalletNew" size="20px" opacity={0.6} />
        </Flex>
      )}

      {!isOnboarding && (
        <>
          <Flex
            alignItems="center"
            py={1}
            pl={1}
            pr={2}
            background={ethBg}
            borderRadius={6}
          >
            <Icons mr="6px" name="Ethereum" pointerEvents="none" />
            <Text fontSize={1} fontWeight={500} color={'#627EEA'}>
              Ethereum
            </Text>
          </Flex>
          {/* <RadioGroup
            customBg={windowColor}
            textColor={textColor}
            selected={network}
            options={[
              // {
              //   label: 'Bitcoin',
              //   icon: 'Bitcoin',
              //   value: 'bitcoin',
              //   highlightColor: '#F7931A',
              // },
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
          /> */}
          <IconButton onClick={onAddWallet}>
            <Icons name="Plus" />
          </IconButton>
        </>
      )}
    </Flex>
  );
};
