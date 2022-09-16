import { FC, useMemo, Dispatch, SetStateAction } from 'react';
import { observer } from 'mobx-react';
import { Button, Flex, Text, Box, Icons, TextButton } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from 'renderer/apps/Wallet/lib/helpers';
import { NewWalletScreen } from './index';

interface CreateProps {
  setScreen: Dispatch<SetStateAction<NewWalletScreen>>;
}

export const Create: FC<CreateProps> = observer((props: CreateProps) => {
  const { desktop } = useServices();
  const theme = useMemo(() => getBaseTheme(desktop), [desktop.theme.mode]);

  return (
    <Flex width="100%" height="100%" flexDirection="column">
      <Flex
        flex={4}
        flexDirection="column"
        alignItems="center"
      >
        <Text mt={6} variant="h4">No Wallet Found</Text>
        <Text px="30px" mt={2} mb={5} variant="body" color={theme.colors.text.secondary} textAlign="center">You haven't yet configured your Realm wallet.</Text>
        <Box mt={9}>
          <Button onClick={() => props.setScreen(NewWalletScreen.BACKUP)}>
            Create a new wallet
          </Button>
        </Box>
        <Box mt={3}>
          <TextButton textColor={theme.colors.text.secondary} onClick={() => props.setScreen(NewWalletScreen.IMPORT)}>
            Or import an existing wallet
          </TextButton>
        </Box>
      </Flex>
      <Flex mb={6} mx={3} justifyContent="center" alignItems="center">
        <Box>
          <Icons name="InfoCircle" color={theme.colors.brand.secondary} />
        </Box>
        <Box>
          <Text
            ml={2}
            variant="hint"
            justifyContent="flex-end"
            color={theme.colors.brand.secondary}
          >
            You are using pre-release software. Only use for development
            purposes.
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
});
