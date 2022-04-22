import { FC, useMemo } from 'react';
import { createField, createForm } from 'mobx-easy-form';
import * as yup from 'yup';
import { useMst } from 'renderer/logic/store';
import { observer } from 'mobx-react';

import {
  Grid,
  Sigil,
  Text,
  Flex,
  ActionButton,
  Icons,
  Spinner,
} from '../../../../components';

type InstallStepProps = {
  // isValid: boolean;
  // setValid: (isValid: boolean) => void;
};

export const StepInstall: FC<InstallStepProps> = observer(
  (props: InstallStepProps) => {
    const { authStore } = useMst();
    const shipName = '~lomder-librun';
    const shipColor = '#F08735';
    const avatar = null;

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
          <Text mt={3}>{shipName}</Text>
          <Flex flexDirection="column" alignItems="center">
            <ActionButton
              tabIndex={-1}
              mt={5}
              height={32}
              style={{ width: 200 }}
              rightContent={
                authStore.installer.isLoading ? (
                  <Spinner size={0} />
                ) : authStore.installer.isLoaded ? (
                  <Icons ml={2} size={1} name="CheckCircle" />
                ) : (
                  <Icons ml={2} size={1} name="DownloadCircle" />
                )
              }
              onClick={() => authStore.installRealm()}
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
              {!authStore.installer.isLoaded
                ? 'This will just take a minute'
                : 'Congrats! You are ready to enter a new world.'}
            </Text>
          </Flex>
        </Flex>
      </Grid.Column>
    );
  }
);

export default StepInstall;
