import { FC, useMemo, Dispatch, SetStateAction } from 'react';
import { observer } from 'mobx-react';
import { Button, Flex, Text, Box, Icons } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from 'renderer/apps/Wallet/lib/helpers';
import { NewWalletScreen } from './index';

interface CreateProps {
  setScreen: Dispatch<SetStateAction<NewWalletScreen>>;
}

export const Create: FC<CreateProps> = observer((props: CreateProps) => {
  const { theme } = useServices();
  const themeData = useMemo(
    () => getBaseTheme(theme.currentTheme),
    [theme.currentTheme.mode]
  );
  console.log(theme.currentTheme);
  console.log(themeData);
  return (
    <Flex width="100%" height="100%" flexDirection="column">
      <Flex
        flex={4}
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Box>
          <Button onClick={() => props.setScreen(NewWalletScreen.BACKUP)}>
            Create a new wallet
          </Button>
        </Box>
      </Flex>
      <Flex justifyContent="center" alignItems="center">
        <Box>
          <Icons name="InfoCircle" color={themeData.colors.brand.secondary} />
        </Box>
        <Box>
          <Text
            ml={2}
            variant="hint"
            justifyContent="flex-end"
            color={themeData.colors.brand.secondary}
          >
            You are using pre-release software. Only use for development
            purposes.
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
});
