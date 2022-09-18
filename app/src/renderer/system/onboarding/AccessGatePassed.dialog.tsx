import { FC } from 'react';
import { Text, Flex, Box, Button } from 'renderer/components';
import { observer } from 'mobx-react';
import { BaseDialogProps } from 'renderer/system/dialog/dialogs';

const AccessGatePassed: FC<BaseDialogProps> = observer(
  (props: BaseDialogProps) => {

    return (
      <Flex width="100%" height="100%" flexDirection="column">
        <Text fontSize={3} fontWeight={500} mb={20}>
          Invite Code Approved
        </Text>
        <Text mt={3} fontSize={2} lineHeight="copy" variant="body">
          Your invite code was approved; you can now continue signing up for Realm.
        </Text>
        <Flex mt={8} width="100%" height="35%" justifyContent="center" alignItems="center">
          <Button onClick={() => props.onNext && props.onNext()}>Get started</Button>
        </Flex>
      </Flex>
    );
  }
);

export default AccessGatePassed;
