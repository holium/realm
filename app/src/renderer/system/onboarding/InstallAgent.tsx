import { FC } from 'react';
import { observer } from 'mobx-react';

import {
  Grid,
  Sigil,
  Text,
  Flex,
  ActionButton,
  Icons,
  Spinner,
  Box,
  TextButton,
} from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { OnboardingActions } from 'renderer/logic/actions/onboarding';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';

export const InstallAgent: FC<BaseDialogProps> = observer(
  (props: BaseDialogProps) => {
    const { onboarding } = useServices();


    const shipName = onboarding.ship!.patp;
    const shipNick = onboarding.ship!.nickname;
    const shipColor = onboarding.ship!.color!;
    const avatar = onboarding.ship!.avatar;

    return (
      <Grid.Column pl={12} noGutter lg={12} xl={12} width="100%">
        <Text fontSize={4} mb={1} variant="body">
          Installation
        </Text>
        <Text
          fontSize={2}
          fontWeight={200}
          lineHeight="20px"
          variant="body"
          opacity={0.6}
          mb={4}
        >
          We need to install Realm and other agents on your Urbit server. These
          handle core OS functionality.
        </Text>
        <Flex
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Sigil
            simple={false}
            size={52}
            avatar={avatar}
            patp={shipName}
            borderRadiusOverride="6px"
            color={[shipColor, 'white']}
          />
          <Flex
            style={{ width: 210 }}
            transition={{ duration: 0.15 }}
            animate={{ marginBottom: shipNick ? 24 : 0 }}
            position="relative"
            mt={3}
            alignItems="center"
            flexDirection="column"
          >
            {shipNick && (
              <Text position="absolute" fontWeight={500}>
                {shipNick}
              </Text>
            )}
            <Text
              transition={{ duration: 0, y: { duration: 0 } }}
              animate={{
                opacity: shipNick ? 0.5 : 1,
                y: shipNick ? 22 : 0,
              }}
            >
              {shipName}
            </Text>
          </Flex>
          <Flex flexDirection="column" alignItems="center">
            <ActionButton
              tabIndex={-1}
              mt={5}
              height={32}
              style={{ width: 200 }}
              rightContent={
                onboarding.installer.isLoading ? (
                  <Spinner size={0} />
                ) : onboarding.installer.isLoaded ? (
                  <Icons ml={2} size={1} name="CheckCircle" />
                ) : (
                  <Icons ml={2} size={1} name="DownloadCircle" />
                )
              }
              onClick={() => OnboardingActions.installRealm()}
            >
              Install Realm
            </ActionButton>
            <Text
              fontSize={2}
              fontWeight={200}
              lineHeight="20px"
              variant="body"
              opacity={0.6}
              mt={3}
            >
              {!onboarding.installer.isLoaded
                ? 'This will just take a minute'
                : 'Congrats! You are ready to enter a new world.'}
            </Text>
          </Flex>
        </Flex>
        <Box position="absolute" height={40} bottom={20} right={24}>
          <Flex
            mt={5}
            width="100%"
            alignItems="center"
            justifyContent="space-between"
          >
            <TextButton
              disabled={!onboarding.installer.isLoaded}
              onClick={async (evt: any) => {
                await OnboardingActions.completeOnboarding();
                props.onNext && props.onNext();
              }}
            >
              Next
            </TextButton>
          </Flex>
        </Box>
      </Grid.Column>
    );
  }
);

export default InstallAgent;
