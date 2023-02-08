import { rgba } from 'polished';
import { Icon, Flex, Button, Text } from '@holium/design-system';
import { WalletActions } from 'renderer/logic/actions/wallet';

type Network = 'ethereum' | 'bitcoin';

type Props = {
  showBack: boolean;
  isOnboarding: boolean;
  theme: {
    iconColor: string;
    windowColor: string;
    textColor: string;
    mode: string;
  };
  network: Network | string;
  onSetNetwork: (network: Network) => void;
  onAddWallet: () => void;
  hide: boolean;
};
const ethBg = rgba('#627EEA', 0.14);
export const WalletHeader = ({
  theme,
  hide,
  showBack,
  isOnboarding,
  onAddWallet,
}: Props) => {
  if (hide) return null;

  return (
    <Flex
      width="100%"
      justifyContent="space-between"
      alignItems="center"
      // height={40}
      pb={2}
    >
      {showBack && !isOnboarding ? (
        <Button.IconButton
          size={26}
          mt={isOnboarding ? 1 : 0}
          onClick={async () => await WalletActions.navigateBack()}
        >
          <Icon name="ArrowLeftLine" size={24} opacity={0.7} />
        </Button.IconButton>
      ) : (
        <Flex
          mt={isOnboarding ? 1 : 0}
          justifyContent="center"
          alignItems="center"
          width="26px"
        >
          <Icon name="WalletTray" size={24} opacity={0.6} />
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
            <Icon mr="6px" size={20} name="Ethereum" pointerEvents="none" />
            <Text.Custom
              fontSize={2}
              fontWeight={500}
              style={{
                color: theme.mode === 'dark' ? '#869cf5' : '#627EEA',
              }}
            >
              Ethereum
            </Text.Custom>
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
          <Button.IconButton size={26} onClick={onAddWallet}>
            <Icon name="Plus" size={24} opacity={0.5} />
          </Button.IconButton>
        </>
      )}
    </Flex>
  );
};
