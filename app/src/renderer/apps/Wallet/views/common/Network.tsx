import { darken } from 'polished';
import { observer } from 'mobx-react';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { FC } from 'react';
import { Box, Flex, Text, RadioGroup, IconButton } from 'renderer/components';

type Network = 'ethereum' | 'bitcoin';

interface WalletNetwork {
  theme: ThemeModelType
  hidden: boolean
}

export const WalletNetwork: FC<WalletNetwork> = observer((props: WalletNetwork) => {
  return (
    <Box width="100%" hidden={props.hidden}>
      <Flex position="absolute" bottom={0} pr="12px" pb="12px" width="100%" justifyContent="flex-end">
        <Flex width="fit-content" height={2} px={2} alignItems="center" justifyContent="center" borderRadius="33px" background={darken(.03, props.theme.windowColor)}>
          <Box height="8px" width="8px" mr={2} borderRadius="50%" background="#4CDD86" />
          <Text fontSize="12px" color="rgba(0, 0, 0, 0.5)">
            localhost:8545
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
});
