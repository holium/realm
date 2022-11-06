import { darken, lighten } from 'polished';
import { observer } from 'mobx-react';
import { ThemeModelType } from 'os/services/theme.model';
import { FC } from 'react';
import { Box, Flex, Text, RadioGroup, IconButton } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from '../../lib/helpers';
import { WalletActions } from 'renderer/logic/actions/wallet';

type Network = 'ethereum' | 'bitcoin';

interface WalletNetworkProps {
  network:
    | 'Ethereum Mainnet'
    | 'Görli Testnet'
    | 'Bitcoin Mainnet'
    | 'Bitcoin Testnet';
}

export const WalletNetwork: FC<WalletNetworkProps> = observer(
  (props: WalletNetworkProps) => {
    const { theme } = useServices();
    const themeData = getBaseTheme(theme.currentTheme);

    return (
<<<<<<< HEAD
      <Flex
        width="fit-content"
        height={2}
        px={2}
        alignItems="center"
        justifyContent="center"
        borderRadius="33px"
        background={darken(0.03, theme.currentTheme.windowColor)}
        onClick={WalletActions.toggleNetwork}
      >
        <Box
          height="8px"
          width="8px"
          mr={2}
          borderRadius="50%"
          background="#4CDD86"
        />
        <Text fontSize="12px" color={themeData.colors.ui.secondary}>
          {props.network}
        </Text>
      </Flex>
=======
      <Box width="100%" hidden={props.hidden}>
        <Flex
          position="absolute"
          bottom={0}
          pr="12px"
          pb="12px"
          width="100%"
          justifyContent="flex-end"
        >
          <Flex
            width="fit-content"
            height={2}
            px={2}
            alignItems="center"
            justifyContent="center"
            borderRadius="33px"
            background={darken(0.03, theme.currentTheme.windowColor)}
          >
            <Box
              height="8px"
              width="8px"
              mr={2}
              borderRadius="50%"
              background="#4CDD86"
            />
            <Text fontSize="12px" color={themeData.colors.ui.secondary}>
              Goerli Testnet
            </Text>
          </Flex>
        </Flex>
      </Box>
>>>>>>> main
    );
  }
);
